import { adminDb } from '$lib/server/firebase-admin';
import type { PageServerLoad } from './$types';
import type { Product } from '$lib/types';

export const load: PageServerLoad = async () => {
	const snap = await adminDb
		.collection('products')
		.where('active', '==', true)
		.where('stockQty', '>', 0)
		.orderBy('stockQty')
		.orderBy('updatedAt', 'desc')
		.limit(100)
		.get();

	const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
	return { products };
};
