import { fail } from '@sveltejs/kit';
import { adminDb, adminAuth } from '$lib/server/firebase-admin';
import type { Actions, PageServerLoad } from './$types';
import type { AppUser } from '$lib/types';

export const load: PageServerLoad = async () => {
	const snap = await adminDb.collection('users').orderBy('createdAt', 'desc').limit(300).get();
	const users = snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as AppUser);
	return { users };
};

export const actions: Actions = {
	disable: async ({ request }) => {
		const form = await request.formData();
		const uid = String(form.get('uid') ?? '');
		const disabled = form.get('disabled') === 'true';

		if (!uid) return fail(400, { error: 'Missing user id' });

		await adminAuth.updateUser(uid, { disabled });
		await adminDb.collection('users').doc(uid).update({ disabled });
		return { status: 'ok' };
	}
};
