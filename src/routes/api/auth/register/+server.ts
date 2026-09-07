import { json } from '@sveltejs/kit';
import { adminAuth, adminDb } from '$lib/server/firebase-admin';
import type { RequestHandler } from './$types';
import type { Role } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
	const { idToken, name, role, businessName, phone } = await request.json();

	if (!idToken || !name || !role) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}
	if (role !== 'customer' && role !== 'vendor') {
		// Admin accounts are provisioned manually, never through public signup.
		return json({ error: 'Invalid role' }, { status: 400 });
	}

	try {
		const decoded = await adminAuth.verifyIdToken(idToken, true);
		const uid = decoded.uid;

		const existing = await adminDb.collection('users').doc(uid).get();
		if (existing.exists) {
			return json({ error: 'Profile already exists' }, { status: 409 });
		}

		const profile: Record<string, unknown> = {
			email: decoded.email ?? '',
			name,
			role: role as Role,
			createdAt: Date.now()
		};

		if (role === 'vendor') {
			profile.vendorApproved = false; // admin must approve before selling
			profile.businessName = businessName ?? name;
			profile.phone = phone ?? '';
		}

		await adminDb.collection('users').doc(uid).set(profile);
		await adminAuth.setCustomUserClaims(uid, { role });

		return json({ status: 'ok', role });
	} catch (err) {
		console.error('Registration failed', err);
		return json({ error: 'Registration failed' }, { status: 500 });
	}
};
