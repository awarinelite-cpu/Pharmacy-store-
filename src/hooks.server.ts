import { redirect, type Handle } from '@sveltejs/kit';
import { adminAuth, adminDb } from '$lib/server/firebase-admin';
import type { AppUser, Role } from '$lib/types';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionCookie = event.cookies.get('session');

	if (sessionCookie) {
		try {
			const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
			const snap = await adminDb.collection('users').doc(decoded.uid).get();

			if (snap.exists) {
				const profile = { uid: decoded.uid, ...(snap.data() as Omit<AppUser, 'uid'>) };
				event.locals.user = profile.disabled ? null : profile;
				if (profile.disabled) event.cookies.delete('session', { path: '/' });
			} else {
				// Auth account exists but no Firestore profile yet — treat as signed out.
				event.locals.user = null;
			}
		} catch {
			// Expired/invalid cookie.
			event.locals.user = null;
			event.cookies.delete('session', { path: '/' });
		}
	} else {
		event.locals.user = null;
	}

	const path = event.url.pathname;
	const user = event.locals.user;

	const roleForPrefix = (p: string): Role | null => {
		if (p.startsWith('/admin')) return 'admin';
		if (p.startsWith('/vendor')) return 'vendor';
		// Browsing the shop and viewing the cart are public; only checkout and
		// order history require a signed-in customer.
		if (p.startsWith('/shop/checkout') || p.startsWith('/shop/orders')) return 'customer';
		return null;
	};

	const requiredRole = roleForPrefix(path);

	if (requiredRole) {
		if (!user) {
			throw redirect(303, `/login?redirectTo=${encodeURIComponent(path)}`);
		}
		if (user.role !== requiredRole) {
			throw redirect(303, '/');
		}
		if (requiredRole === 'vendor' && !user.vendorApproved && path !== '/vendor/pending') {
			throw redirect(303, '/vendor/pending');
		}
	}

	return resolve(event);
};
