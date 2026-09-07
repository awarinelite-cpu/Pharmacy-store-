import { adminDb } from '$lib/server/firebase-admin';
import type { PageServerLoad } from './$types';
import type { Order } from '$lib/types';

export const load: PageServerLoad = async () => {
	const snap = await adminDb.collection('orders').orderBy('createdAt', 'desc').limit(200).get();
	const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
	return { orders };
};
