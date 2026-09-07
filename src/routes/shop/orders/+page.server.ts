import { adminDb } from '$lib/server/firebase-admin';
import type { PageServerLoad } from './$types';
import type { Order } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	const uid = locals.user!.uid;

	const snap = await adminDb
		.collection('orders')
		.where('customerId', '==', uid)
		.orderBy('createdAt', 'desc')
		.get();

	const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
	return { orders };
};
