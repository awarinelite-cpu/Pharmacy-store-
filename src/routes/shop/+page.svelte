<script lang="ts">
	import { cart } from '$lib/stores/cart';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let query = $state('');

	let filtered = $derived(
		data.products.filter((p) => {
			const q = query.trim().toLowerCase();
			if (!q) return true;
			return (
				p.name.toLowerCase().includes(q) ||
				p.genericName?.toLowerCase().includes(q) ||
				p.category.toLowerCase().includes(q)
			);
		})
	);

	function addToCart(p: (typeof data.products)[number]) {
		cart.add(
			{
				productId: p.id,
				vendorId: p.vendorId,
				vendorName: p.vendorName,
				name: p.name,
				unitPrice: p.price,
				maxQty: p.stockQty
			},
			1
		);
	}
</script>

<h1>Shop</h1>

<input class="search" placeholder="Search drugs, categories…" bind:value={query} />

<div class="grid">
	{#each filtered as p (p.id)}
		<div class="product-card">
			<h3>{p.name}</h3>
			{#if p.genericName}<p class="muted">{p.genericName}</p>{/if}
			<p class="category">{p.category}</p>
			<p class="vendor">Sold by {p.vendorName}</p>
			{#if p.prescriptionRequired}<p class="rx">Prescription required</p>{/if}
			<div class="price-row">
				<span class="price">₦{(p.price / 100).toLocaleString()}</span>
				<span class="stock">{p.stockQty} {p.unit} left</span>
			</div>
			<button onclick={() => addToCart(p)}>Add to cart</button>
		</div>
	{:else}
		<p class="muted">No products match your search.</p>
	{/each}
</div>

<style>
	.search {
		width: 100%;
		max-width: 420px;
		padding: 0.6rem;
		border: 1px solid #ccc;
		border-radius: 6px;
		margin: 1rem 0 1.5rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 1rem;
	}
	.product-card {
		border: 1px solid #eee;
		border-radius: 8px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.muted {
		color: #888;
		font-size: 0.8rem;
	}
	.category {
		font-size: 0.75rem;
		text-transform: uppercase;
		color: #0d7a5f;
		letter-spacing: 0.03em;
	}
	.vendor {
		font-size: 0.75rem;
		color: #666;
	}
	.rx {
		font-size: 0.75rem;
		color: #b3261e;
		font-weight: 600;
	}
	.price-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-top: 0.4rem;
	}
	.price {
		font-weight: 700;
	}
	.stock {
		font-size: 0.75rem;
		color: #888;
	}
	button {
		margin-top: 0.5rem;
		padding: 0.5rem;
		border: none;
		border-radius: 6px;
		background: #0d7a5f;
		color: white;
		cursor: pointer;
		font-weight: 600;
	}
</style>
