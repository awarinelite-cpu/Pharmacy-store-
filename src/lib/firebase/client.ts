import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

const firebaseConfig = {
	apiKey: env.PUBLIC_FIREBASE_API_KEY,
	authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: env.PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: env.PUBLIC_FIREBASE_APP_ID
};

// The Firebase JS (client) SDK assumes a browser: getAuth() in particular
// reaches for indexedDB/window during setup and throws when it runs in
// Node during SSR. Every route renders the root layout, which imports this
// module, so initializing unconditionally crashed every single page.
//
// All real data access already goes through +page.server.ts files using
// the Admin SDK — this client SDK is only ever used inside browser event
// handlers (login/signup/checkout button clicks), which only run after
// hydration. So it's safe to skip initialization entirely on the server.
let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;
let _storage: FirebaseStorage | undefined;

if (browser) {
	if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
		console.error(
			'Firebase client config is incomplete — set PUBLIC_FIREBASE_* environment variables.'
		);
	}
	_app = getApps().length ? getApp() : initializeApp(firebaseConfig);
	_auth = getAuth(_app);
	_db = getFirestore(_app);
	_storage = getStorage(_app);
}

// Cast away `| undefined`: these are only ever consumed inside browser
// event handlers (never at module scope, never during SSR), so at every
// real call site the value is guaranteed to be set.
export const app = _app as FirebaseApp;
export const auth = _auth as Auth;
export const db = _db as Firestore;
export const storage = _storage as FirebaseStorage;
