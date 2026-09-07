import { writable } from 'svelte/store';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '$lib/firebase/client';

export const firebaseUser = writable<User | null>(null);
export const authReady = writable(false);

onAuthStateChanged(auth, (user) => {
	firebaseUser.set(user);
	authReady.set(true);
});
