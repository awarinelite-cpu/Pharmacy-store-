<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	let query = $state('');
	let filtered = $derived(
		data.products.filter((p) => {
			const q = query.trim().toLowerCase();
			if (!q) return true;
			return p.name.toLowerCase().includes(q) || p.vendorName.toLowerCase().includes(q);
		})
	);
</script>

<h1>All products</h1>

<input class="search" placeholder="Search by name or vendor…" bind:value={query} />

<table>
	<thead>
		<tr>
			<th>Product</th>
			<th>Vendor</th>
			<th>Category</th>
			<th>Price</th>
			<th>Stock</th>
			<th>Status</th>
		</tr>
	</thead>
	<tbody>
		{#each filtered as p (p.id)}
			<tr class:inactive={!p.active}>
				<td>{p.name}</td>
				<td>{p.vendorName}</td>
				<td>{p.category}</td>
				<td>₦{(p.price / 100).toLocaleString()}</td>
				<td class:low={p.stockQty <= 5}>{p.stockQty} {p.unit}</td>
				<td>{p.active ? 'Active' : 'Hidden'}</td>
			</tr>
		{:else}
			<tr><td colspan="6" class="muted">No products found.</td></tr>
		{/each}
	</tbody>
</table>

<style>
	.search {
		width: 100%;
		max-width: 420px;
		padding: 0.6rem;
		border: 1px solid #ccc;
		border-radius: 6px;
		margin: 1rem 0 1.5rem;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
	}
	th,
	td {
		text-align: left;
		padding: 0.6rem 0.5rem;
		border-bottom: 1px solid #eee;
	}
	tr.inactive {
		opacity: 0.5;
	}
	.low {
		color: #b3261e;
		font-weight: 600;
	}
	.muted {
		color: #888;
	}
</style>
