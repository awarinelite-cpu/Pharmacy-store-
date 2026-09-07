import { adminDb } from '$lib/server/firebase-admin';
import type { PageServerLoad } from './$types';
import type { AppUser } from '$lib/types';

export const load: PageServerLoad = async () => {
	const [usersSnap, productsSnap, ordersSnap] = await Promise.all([
		adminDb.collection('users').get(),
		adminDb.collection('products').get(),
		adminDb.collection('orders').get()
	]);

	const users = usersSnap.docs.map((d) => d.data() as AppUser);
	const vendors = users.filter((u) => u.role === 'vendor');
	const pendingVendors = vendors.filter((v) => !v.vendorApproved);
	const customers = users.filter((u) => u.role === 'customer');

	return {
		vendorCount: vendors.length,
		pendingVendorCount: pendingVendors.length,
		customerCount: customers.length,
		productCount: productsSnap.size,
		orderCount: ordersSnap.size
	};
};
