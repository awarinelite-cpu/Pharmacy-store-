import { fail } from '@sveltejs/kit';
import { adminDb } from '$lib/server/firebase-admin';
import type { Actions, PageServerLoad } from './$types';
import type { Product } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	const uid = locals.user!.uid;

	const snap = await adminDb
		.collection('products')
		.where('vendorId', '==', uid)
		.orderBy('updatedAt', 'desc')
		.get();

	const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);

	return { products };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const user = locals.user!;
		const form = await request.formData();

		const name = String(form.get('name') ?? '').trim();
		const genericName = String(form.get('genericName') ?? '').trim();
		const category = String(form.get('category') ?? '').trim();
		const priceNaira = Number(form.get('price'));
		const stockQty = Number(form.get('stockQty'));
		const unit = String(form.get('unit') ?? 'unit').trim();
		const prescriptionRequired = form.get('prescriptionRequired') === 'on';
		const batchNumber = String(form.get('batchNumber') ?? '').trim();
		const expiryDate = String(form.get('expiryDate') ?? '').trim();

		if (!name || !category || !Number.isFinite(priceNaira) || priceNaira <= 0) {
			return fail(400, { error: 'Name, category, and a valid price are required.' });
		}
		if (!Number.isFinite(stockQty) || stockQty < 0) {
			return fail(400, { error: 'Stock quantity must be zero or more.' });
		}

		const now = Date.now();
		const docRef = adminDb.collection('products').doc();

		const product: Omit<Product, 'id'> = {
			vendorId: user.uid,
			vendorName: user.businessName ?? user.name,
			name,
			genericName: genericName || undefined,
			category,
			price: Math.round(priceNaira * 100), // store kobo
			stockQty: Math.round(stockQty),
			unit: unit || 'unit',
			prescriptionRequired,
			batchNumber: batchNumber || undefined,
			expiryDate: expiryDate || undefined,
			active: true,
			createdAt: now,
			updatedAt: now
		};

		await docRef.set(product);

		if (stockQty > 0) {
			await adminDb.collection('inventory_logs').add({
				productId: docRef.id,
				vendorId: user.uid,
				change: Math.round(stockQty),
				reason: 'initial stock',
				balanceAfter: Math.round(stockQty),
				actorUid: user.uid,
				createdAt: now
			});
		}

		return { status: 'created' };
	},

	adjustStock: async ({ request, locals }) => {
		const user = locals.user!;
		const form = await request.formData();

		const productId = String(form.get('productId') ?? '');
		const delta = Number(form.get('delta'));
		const reason = String(form.get('reason') ?? 'adjustment').trim();

		if (!productId || !Number.isFinite(delta) || delta === 0) {
			return fail(400, { error: 'Invalid stock adjustment.' });
		}

		const ref = adminDb.collection('products').doc(productId);

		const newBalance = await adminDb.runTransaction(async (tx) => {
			const doc = await tx.get(ref);
			if (!doc.exists) throw new Error('Product not found');
			const data = doc.data() as Product;
			if (data.vendorId !== user.uid) throw new Error('Not your product');

			const newQty = data.stockQty + Math.round(delta);
			if (newQty < 0) throw new Error('Stock cannot go negative');

			tx.update(ref, { stockQty: newQty, updatedAt: Date.now() });
			return newQty;
		}).catch((err: Error) => {
			return err.message;
		});

		if (typeof newBalance === 'string') {
			return fail(400, { error: newBalance });
		}

		await adminDb.collection('inventory_logs').add({
			productId,
			vendorId: user.uid,
			change: Math.round(delta),
			reason: reason || 'adjustment',
			balanceAfter: newBalance,
			actorUid: user.uid,
			createdAt: Date.now()
		});

		return { status: 'adjusted' };
	},

	toggleActive: async ({ request, locals }) => {
		const user = locals.user!;
		const form = await request.formData();
		const productId = String(form.get('productId') ?? '');
		const active = form.get('active') === 'true';

		const ref = adminDb.collection('products').doc(productId);
		const doc = await ref.get();
		if (!doc.exists || (doc.data() as Product).vendorId !== user.uid) {
			return fail(403, { error: 'Not your product' });
		}

		await ref.update({ active: !active, updatedAt: Date.now() });
		return { status: 'toggled' };
	},

	delete: async ({ request, locals }) => {
		const user = locals.user!;
		const form = await request.formData();
		const productId = String(form.get('productId') ?? '');

		const ref = adminDb.collection('products').doc(productId);
		const doc = await ref.get();
		if (!doc.exists || (doc.data() as Product).vendorId !== user.uid) {
			return fail(403, { error: 'Not your product' });
		}

		await ref.delete();
		return { status: 'deleted' };
	}
};
