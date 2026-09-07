import { json } from '@sveltejs/kit';
import { adminAuth } from '$lib/server/firebase-admin';
import type { RequestHandler } from './$types';

const SESSION_EXPIRES_IN = 60 * 60 * 24 * 5 * 1000; // 5 days

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { idToken } = await request.json();

	if (!idToken) {
		return json({ error: 'Missing idToken' }, { status: 400 });
	}

	try {
		// Verify the token is fresh (issued within the last 5 minutes) before minting a session.
		await adminAuth.verifyIdToken(idToken, true);

		const sessionCookie = await adminAuth.createSessionCookie(idToken, {
			expiresIn: SESSION_EXPIRES_IN
		});

		cookies.set('session', sessionCookie, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: SESSION_EXPIRES_IN / 1000
		});

		return json({ status: 'ok' });
	} catch (err) {
		console.error('Session creation failed', err);
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
};
