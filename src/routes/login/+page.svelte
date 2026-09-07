<script lang="ts">
	import { signInWithEmailAndPassword } from 'firebase/auth';
	import { auth } from '$lib/firebase/client';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	const redirectTo = page.url.searchParams.get('redirectTo') ?? '/';

	async function handleLogin(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;
		try {
			const cred = await signInWithEmailAndPassword(auth, email, password);
			const idToken = await cred.user.getIdToken();

			const res = await fetch('/api/auth/session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ idToken })
			});

			if (!res.ok) throw new Error('Could not start session');

			await goto(redirectTo, { invalidateAll: true });
		} catch (err) {
			console.error(err);
			error = 'Invalid email or password.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="auth-page">
	<form onsubmit={handleLogin}>
		<h1>Log in</h1>

		{#if error}
			<p class="error">{error}</p>
		{/if}

		<label>
			Email
			<input type="email" bind:value={email} required autocomplete="email" />
		</label>

		<label>
			Password
			<input type="password" bind:value={password} required autocomplete="current-password" />
		</label>

		<button type="submit" disabled={loading}>
			{loading ? 'Logging in…' : 'Log in'}
		</button>

		<p class="switch">No account? <a href="/signup">Sign up</a></p>
	</form>
</div>

<style>
	.auth-page {
		display: flex;
		justify-content: center;
		padding: 4rem 1rem;
	}
	form {
		width: 100%;
		max-width: 360px;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.9rem;
	}
	input {
		padding: 0.6rem;
		border: 1px solid #ccc;
		border-radius: 6px;
	}
	button {
		margin-top: 0.5rem;
		padding: 0.7rem;
		border: none;
		border-radius: 6px;
		background: #0d7a5f;
		color: white;
		font-weight: 600;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.6;
		cursor: default;
	}
	.error {
		color: #b3261e;
		font-size: 0.9rem;
	}
	.switch {
		font-size: 0.85rem;
		text-align: center;
	}
</style>
