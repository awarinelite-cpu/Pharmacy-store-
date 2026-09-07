import { adminDb } from '$lib/server/firebase-admin';
import type { PageServerLoad } from './$types';
import type { Product, Order } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	const uid = locals.user!.uid;

	const [productsSnap, ordersSnap] = await Promise.all([
		adminDb.collection('products').where('vendorId', '==', uid).get(),
		adminDb
			.collection('orders')
			.where('vendorId', '==', uid)
			.orderBy('createdAt', 'desc')
			.limit(10)
			.get()
	]);

	const products = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
	const recentOrders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);

	const lowStock = products.filter((p) => p.stockQty <= 5 && p.active);
	const pendingOrders = recentOrders.filter((o) => o.status === 'paid' || o.status === 'processing');

	return {
		totalProducts: products.length,
		lowStock,
		pendingOrdersCount: pendingOrders.length,
		recentOrders
	};
};
