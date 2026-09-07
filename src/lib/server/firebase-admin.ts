import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
// Dynamic (not static) private env: read at request time, not baked in at
// build time. This is what lets the build succeed even before secrets are
// configured, and lets you rotate keys without a rebuild.
import { env } from '$env/dynamic/private';

let cachedApp: App | undefined;

function getAdminApp(): App {
	if (cachedApp) return cachedApp;

	if (getApps().length) {
		cachedApp = getApps()[0];
		return cachedApp;
	}

	const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = env;

	if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
		throw new Error(
			'Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, ' +
				'and FIREBASE_PRIVATE_KEY in your environment variables.'
		);
	}

	cachedApp = initializeApp({
		credential: cert({
			projectId: FIREBASE_PROJECT_ID,
			clientEmail: FIREBASE_CLIENT_EMAIL,
			// Vercel env vars store the key with literal \n — convert back to real newlines.
			privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
		})
	});
	return cachedApp;
}

// Lazily construct the real Auth/Firestore instance only on first use, not
// at module load. This means importing this file (which happens as soon as
// any route imports hooks.server.ts) never touches credentials or throws —
// only an actual call like adminDb.collection(...) does, and only at
// request time, when runtime env vars are guaranteed to be present.
function lazy<T extends object>(factory: () => T): T {
	let instance: T | undefined;
	return new Proxy({} as T, {
		get(_target, prop) {
			if (!instance) instance = factory();
			const value = Reflect.get(instance as object, prop, instance);
			// Bind methods to the real instance — through the proxy, `this` would
			// otherwise be the proxy itself, breaking the SDK's internal state.
			return typeof value === 'function' ? value.bind(instance) : value;
		}
	});
}

export const adminAuth: Auth = lazy(() => getAuth(getAdminApp()));
export const adminDb: Firestore = lazy(() => getFirestore(getAdminApp()));
