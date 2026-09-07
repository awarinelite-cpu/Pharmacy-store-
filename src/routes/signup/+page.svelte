<script lang="ts">
	import { createUserWithEmailAndPassword } from 'firebase/auth';
	import { auth } from '$lib/firebase/client';
	import { goto } from '$app/navigation';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let role = $state<'customer' | 'vendor'>('customer');
	let businessName = $state('');
	let phone = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSignup(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;
		try {
			const cred = await createUserWithEmailAndPassword(auth, email, password);
			const idToken = await cred.user.getIdToken();

			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ idToken, name, role, businessName, phone })
			});

			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body.error ?? 'Registration failed');
			}

			// Custom claims were just set server-side; force a fresh ID token before
			// starting the session so downstream Firestore rules see the role claim.
			const freshToken = await cred.user.getIdToken(true);

			const sessionRes = await fetch('/api/auth/session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ idToken: freshToken })
			});

			if (!sessionRes.ok) throw new Error('Could not start session');

			if (role === 'vendor') {
				await goto('/vendor/pending', { invalidateAll: true });
			} else {
				await goto('/shop', { invalidateAll: true });
			}
		} catch (err: unknown) {
			console.error(err);
			error = err instanceof Error ? err.message : 'Sign up failed.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="auth-page">
	<form onsubmit={handleSignup}>
		<h1>Create an account</h1>

		{#if error}
			<p class="error">{error}</p>
		{/if}

		<div class="role-toggle">
			<button type="button" class:active={role === 'customer'} onclick={() => (role = 'customer')}>
				I'm a customer
			</button>
			<button type="button" class:active={role === 'vendor'} onclick={() => (role = 'vendor')}>
				I'm a vendor (pharmacy)
			</button>
		</div>

		<label>
			Full name
			<input type="text" bind:value={name} required />
		</label>

		{#if role === 'vendor'}
			<label>
				Pharmacy / business name
				<input type="text" bind:value={businessName} required />
			</label>
			<label>
				Phone number
				<input type="tel" bind:value={phone} required />
			</label>
		{/if}

		<label>
			Email
			<input type="email" bind:value={email} required autocomplete="email" />
		</label>

		<label>
			Password
			<input
				type="password"
				bind:value={password}
				required
				minlength="6"
				autocomplete="new-password"
			/>
		</label>

		<button type="submit" class="submit" disabled={loading}>
			{loading ? 'Creating account…' : 'Sign up'}
		</button>

		{#if role === 'vendor'}
			<p class="hint">Vendor accounts require admin approval before you can list products.</p>
		{/if}

		<p class="switch">Already have an account? <a href="/login">Log in</a></p>
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
		max-width: 380px;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.role-toggle {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}
	.role-toggle button {
		flex: 1;
		padding: 0.6rem 0.4rem;
		border: 1px solid #ccc;
		border-radius: 6px;
		background: white;
		cursor: pointer;
		font-size: 0.85rem;
	}
	.role-toggle button.active {
		border-color: #0d7a5f;
		background: #e6f4ef;
		font-weight: 600;
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
	.submit {
		margin-top: 0.5rem;
		padding: 0.7rem;
		border: none;
		border-radius: 6px;
		background: #0d7a5f;
		color: white;
		font-weight: 600;
		cursor: pointer;
	}
	.submit:disabled {
		opacity: 0.6;
		cursor: default;
	}
	.error {
		color: #b3261e;
		font-size: 0.9rem;
	}
	.hint {
		font-size: 0.8rem;
		color: #666;
	}
	.switch {
		font-size: 0.85rem;
		text-align: center;
	}
</style>
