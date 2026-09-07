import { fail } from '@sveltejs/kit';
import { adminDb } from '$lib/server/firebase-admin';
import type { Actions, PageServerLoad } from './$types';
import type { Order, OrderStatus } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	const uid = locals.user!.uid;

	const snap = await adminDb
		.collection('orders')
		.where('vendorId', '==', uid)
		.orderBy('createdAt', 'desc')
		.get();

	const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
	return { orders };
};

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
	pending: [],
	paid: ['processing', 'cancelled'],
	processing: ['fulfilled', 'cancelled'],
	fulfilled: [],
	cancelled: []
};

export const actions: Actions = {
	updateStatus: async ({ request, locals }) => {
		const uid = locals.user!.uid;
		const form = await request.formData();
		const orderId = String(form.get('orderId') ?? '');
		const nextStatus = String(form.get('status') ?? '') as OrderStatus;

		const ref = adminDb.collection('orders').doc(orderId);
		const doc = await ref.get();
		if (!doc.exists) return fail(404, { error: 'Order not found' });

		const order = doc.data() as Order;
		if (order.vendorId !== uid) return fail(403, { error: 'Not your order' });

		if (!ALLOWED_TRANSITIONS[order.status]?.includes(nextStatus)) {
			return fail(400, { error: `Cannot move order from ${order.status} to ${nextStatus}` });
		}

		await ref.update({ status: nextStatus, updatedAt: Date.now() });
		return { status: 'updated' };
	}
};
