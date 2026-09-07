import { fail } from '@sveltejs/kit';
import { adminDb } from '$lib/server/firebase-admin';
import type { Actions, PageServerLoad } from './$types';
import type { AppUser } from '$lib/types';

export const load: PageServerLoad = async () => {
	const snap = await adminDb.collection('users').where('role', '==', 'vendor').get();
	const vendors = snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as AppUser);
	vendors.sort((a, b) => (a.vendorApproved === b.vendorApproved ? 0 : a.vendorApproved ? 1 : -1));
	return { vendors };
};

export const actions: Actions = {
	setApproval: async ({ request }) => {
		const form = await request.formData();
		const uid = String(form.get('uid') ?? '');
		const approved = form.get('approved') === 'true';

		if (!uid) return fail(400, { error: 'Missing vendor id' });

		await adminDb.collection('users').doc(uid).update({ vendorApproved: approved });
		return { status: 'ok' };
	}
};
