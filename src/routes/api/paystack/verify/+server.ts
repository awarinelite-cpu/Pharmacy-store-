import { json } from '@sveltejs/kit';
import { adminDb } from '$lib/server/firebase-admin';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import type { Product, OrderItem } from '$lib/types';

interface CartLineInput {
	productId: string;
	vendorId: string;
	vendorName: string;
	name: string;
	unitPrice: number;
	qty: number;
}

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) return json({ error: 'Not signed in' }, { status: 401 });

	const { reference, deliveryAddress, lines } = (await request.json()) as {
		reference: string;
		deliveryAddress: string;
		lines: CartLineInput[];
	};

	if (!reference || !lines?.length) {
		return json({ error: 'Missing payment reference or cart' }, { status: 400 });
	}

	const paystackSecretKey = env.PAYSTACK_SECRET_KEY;
	if (!paystackSecretKey) {
		console.error('PAYSTACK_SECRET_KEY is not set');
		return json({ error: 'Payments are not configured yet' }, { status: 500 });
	}

	// Prevent replay: bail if this reference was already used to create orders.
	const existing = await adminDb
		.collection('orders')
		.where('paystackRef', '==', reference)
		.limit(1)
		.get();
	if (!existing.empty) {
		return json({ error: 'This payment has already been processed' }, { status: 409 });
	}

	// Verify with Paystack directly — never trust the client's claimed amount/status.
	const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
		headers: { Authorization: `Bearer ${paystackSecretKey}` }
	});
	const verifyBody = await verifyRes.json();

	if (!verifyRes.ok || !verifyBody.status || verifyBody.data?.status !== 'success') {
		return json({ error: 'Payment could not be verified' }, { status: 402 });
	}

	const paidAmount = verifyBody.data.amount as number; // kobo
	const expectedAmount = lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);

	if (paidAmount !== expectedAmount) {
		return json({ error: 'Paid amount does not match cart total' }, { status: 402 });
	}

	// Group cart lines by vendor — each vendor gets its own order + stock deduction.
	const byVendor = new Map<string, CartLineInput[]>();
	for (const line of lines) {
		const group = byVendor.get(line.vendorId) ?? [];
		group.push(line);
		byVendor.set(line.vendorId, group);
	}

	const createdOrderIds: string[] = [];

	try {
		await adminDb.runTransaction(async (tx) => {
			const now = Date.now();

			// Read + validate stock for every product first (Firestore transactions
			// require all reads before any writes).
			const productRefs = lines.map((l) => adminDb.collection('products').doc(l.productId));
			const productDocs = await Promise.all(productRefs.map((ref) => tx.get(ref)));

			productDocs.forEach((doc, i) => {
				const line = lines[i];
				if (!doc.exists) throw new Error(`Product ${line.name} no longer exists`);
				const product = doc.data() as Product;
				if (product.stockQty < line.qty) {
					throw new Error(`Not enough stock for ${line.name}`);
				}
			});

			// Decrement stock.
			productDocs.forEach((doc, i) => {
				const line = lines[i];
				const product = doc.data() as Product;
				tx.update(doc.ref, { stockQty: product.stockQty - line.qty, updatedAt: now });

				const logRef = adminDb.collection('inventory_logs').doc();
				tx.set(logRef, {
					productId: line.productId,
					vendorId: line.vendorId,
					change: -line.qty,
					reason: 'sale',
					balanceAfter: product.stockQty - line.qty,
					actorUid: user.uid,
					createdAt: now
				});
			});

			// Create one order per vendor.
			for (const [vendorId, vendorLines] of byVendor) {
				const orderRef = adminDb.collection('orders').doc();
				createdOrderIds.push(orderRef.id);

				const items: OrderItem[] = vendorLines.map((l) => ({
					productId: l.productId,
					vendorId: l.vendorId,
					name: l.name,
					unitPrice: l.unitPrice,
					qty: l.qty
				}));

				const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);

				tx.set(orderRef, {
					customerId: user.uid,
					customerName: user.name,
					vendorId,
					items,
					subtotal,
					status: 'paid',
					paystackRef: reference,
					deliveryAddress: deliveryAddress ?? '',
					createdAt: now,
					updatedAt: now
				});
			}
		});
	} catch (err) {
		console.error('Order finalization failed', err);
		const message = err instanceof Error ? err.message : 'Order could not be completed';
		// Payment succeeded but stock/order failed — surface clearly so support can reconcile.
		return json({ error: `Payment succeeded but order failed: ${message}` }, { status: 500 });
	}

	return json({ status: 'ok', orderIds: createdOrderIds });
};
