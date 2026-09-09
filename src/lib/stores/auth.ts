import { writable } from 'svelte/store';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '$lib/firebase/client';
import { browser } from '$app/environment';

export const firebaseUser = writable<User | null>(null);
export const authReady = writable(false);

// auth is only initialized in the browser (see firebase/client.ts) — guard
// so this module doesn't crash if it's ever imported into SSR code.
if (browser) {
	onAuthStateChanged(auth, (user) => {
		firebaseUser.set(user);
		authReady.set(true);
	});
}
