<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { goto, invalidateAll } from '$app/navigation';
	import { signOut } from 'firebase/auth';
	import { auth } from '$lib/firebase/client';

	let { children, data } = $props();

	async function handleLogout() {
		await signOut(auth);
		await fetch('/api/auth/logout', { method: 'POST' });
		await invalidateAll();
		await goto('/login');
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="topbar">
	<a class="brand" href="/">Pharmacy</a>
	<nav>
		{#if data.user?.role === 'admin'}
			<a href="/admin">Admin</a>
		{:else if data.user?.role === 'vendor'}
			<a href="/vendor">Dashboard</a>
			<a href="/vendor/inventory">Inventory</a>
			<a href="/vendor/orders">Orders</a>
		{:else if data.user?.role === 'customer'}
			<a href="/shop">Shop</a>
			<a href="/shop/cart">Cart</a>
			<a href="/shop/orders">My orders</a>
		{:else}
			<a href="/shop">Shop</a>
		{/if}

		{#if data.user}
			<span class="who">{data.user.name}</span>
			<button onclick={handleLogout}>Log out</button>
		{:else}
			<a href="/login">Log in</a>
			<a href="/signup">Sign up</a>
		{/if}
	</nav>
</header>

<main>
	{@render children()}
</main>

<style>
	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.9rem 1.5rem;
		border-bottom: 1px solid #eee;
	}
	.brand {
		font-weight: 700;
		font-size: 1.1rem;
		color: #0d7a5f;
		text-decoration: none;
	}
	nav {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.9rem;
	}
	nav a {
		text-decoration: none;
		color: #333;
	}
	.who {
		color: #888;
		font-size: 0.8rem;
	}
	button {
		border: 1px solid #ccc;
		background: white;
		border-radius: 6px;
		padding: 0.4rem 0.7rem;
		cursor: pointer;
		font-size: 0.85rem;
	}
	main {
		padding: 1.5rem;
	}
</style>
