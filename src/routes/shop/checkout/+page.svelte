<script lang="ts">
	import { cart } from '$lib/stores/cart';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';

	const PUBLIC_PAYSTACK_PUBLIC_KEY = env.PUBLIC_PAYSTACK_PUBLIC_KEY;

	let address = $state('');
	let paying = $state(false);
	let error = $state('');

	let total = $derived($cart.reduce((sum, l) => sum + l.unitPrice * l.qty, 0));
	let user = $derived(page.data.user);

	function loadPaystackScript(): Promise<void> {
		return new Promise((resolve, reject) => {
			if ((window as any).PaystackPop) return resolve();
			const script = document.createElement('script');
			script.src = 'https://js.paystack.co/v1/inline.js';
			script.onload = () => resolve();
			script.onerror = () => reject(new Error('Failed to load Paystack'));
			document.head.appendChild(script);
		});
	}

	async function pay() {
		error = '';
		if (!PUBLIC_PAYSTACK_PUBLIC_KEY) {
			error = 'Payments are not configured yet. Please try again later.';
			return;
		}
		if (!address.trim()) {
			error = 'Please enter a delivery address.';
			return;
		}
		if ($cart.length === 0) {
			error = 'Your cart is empty.';
			return;
		}
		paying = true;
		try {
			await loadPaystackScript();

			const handler = (window as any).PaystackPop.setup({
				key: PUBLIC_PAYSTACK_PUBLIC_KEY,
				email: user.email,
				amount: total, // kobo
				currency: 'NGN',
				metadata: { uid: user.uid },
				callback: (response: { reference: string }) => {
					finalizeOrder(response.reference);
				},
				onClose: () => {
					paying = false;
				}
			});
			handler.openIframe();
		} catch (err) {
			console.error(err);
			error = 'Could not start payment. Try again.';
			paying = false;
		}
	}

	async function finalizeOrder(reference: string) {
		try {
			const res = await fetch('/api/paystack/verify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					reference,
					deliveryAddress: address,
					lines: $cart
				})
			});
			const body = await res.json();
			if (!res.ok) throw new Error(body.error ?? 'Payment verification failed');

			cart.clear();
			await goto('/shop/orders');
		} catch (err) {
			console.error(err);
			error = err instanceof Error ? err.message : 'Something went wrong finalizing your order.';
		} finally {
			paying = false;
		}
	}
</script>

<h1>Checkout</h1>

{#if error}
	<p class="error">{error}</p>
{/if}

<div class="summary">
	{#each $cart as line (line.productId)}
		<div class="line">
			<span>{line.qty}× {line.name}</span>
			<span>₦{((line.unitPrice * line.qty) / 100).toLocaleString()}</span>
		</div>
	{/each}
	<div class="line total">
		<span>Total</span>
		<span>₦{(total / 100).toLocaleString()}</span>
	</div>
</div>

<label class="address">
	Delivery address
	<textarea bind:value={address} rows="3" required></textarea>
</label>

<button class="pay" onclick={pay} disabled={paying}>
	{paying ? 'Processing…' : `Pay ₦${(total / 100).toLocaleString()}`}
</button>

<style>
	.summary {
		border: 1px solid #eee;
		border-radius: 8px;
		padding: 1rem;
		margin: 1rem 0;
		max-width: 420px;
	}
	.line {
		display: flex;
		justify-content: space-between;
		padding: 0.3rem 0;
		font-size: 0.9rem;
	}
	.line.total {
		border-top: 1px solid #eee;
		margin-top: 0.5rem;
		padding-top: 0.6rem;
		font-weight: 700;
	}
	.address {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		max-width: 420px;
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}
	textarea {
		padding: 0.6rem;
		border: 1px solid #ccc;
		border-radius: 6px;
		font-family: inherit;
	}
	.pay {
		padding: 0.7rem 1.4rem;
		border: none;
		border-radius: 6px;
		background: #0d7a5f;
		color: white;
		font-weight: 600;
		cursor: pointer;
	}
	.pay:disabled {
		opacity: 0.6;
		cursor: default;
	}
	.error {
		color: #b3261e;
	}
</style>
