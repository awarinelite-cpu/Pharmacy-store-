<script lang="ts">
	import { page } from '$app/state';

	let user = $derived(page.data.user);
</script>

<div class="landing">
	<h1>Get medicines delivered from trusted pharmacies</h1>
	<p>Browse verified vendors, compare prices, and order online.</p>

	<div class="actions">
		{#if !user}
			<a class="btn primary" href="/shop">Browse the shop</a>
			<a class="btn" href="/signup">Sign up as a vendor</a>
		{:else if user.role === 'customer'}
			<a class="btn primary" href="/shop">Continue shopping</a>
		{:else if user.role === 'vendor'}
			<a class="btn primary" href="/vendor">Go to your dashboard</a>
		{:else if user.role === 'admin'}
			<a class="btn primary" href="/admin">Go to admin panel</a>
		{/if}
	</div>
</div>

<style>
	.landing {
		max-width: 560px;
		margin: 3rem auto;
		text-align: center;
	}
	h1 {
		font-size: 1.8rem;
		line-height: 1.3;
	}
	p {
		color: #666;
		margin-bottom: 1.5rem;
	}
	.actions {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
	}
	.btn {
		padding: 0.7rem 1.4rem;
		border-radius: 6px;
		text-decoration: none;
		font-weight: 600;
		border: 1px solid #0d7a5f;
		color: #0d7a5f;
	}
	.btn.primary {
		background: #0d7a5f;
		color: white;
	}
</style>
