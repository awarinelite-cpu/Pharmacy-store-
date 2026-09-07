<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<h1>All orders</h1>

<table>
	<thead>
		<tr>
			<th>Order</th>
			<th>Customer</th>
			<th>Vendor</th>
			<th>Items</th>
			<th>Total</th>
			<th>Status</th>
			<th>Date</th>
		</tr>
	</thead>
	<tbody>
		{#each data.orders as o (o.id)}
			<tr>
				<td>#{o.id.slice(0, 6)}</td>
				<td>{o.customerName}</td>
				<td>{o.vendorId.slice(0, 6)}</td>
				<td>{o.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</td>
				<td>₦{(o.subtotal / 100).toLocaleString()}</td>
				<td class="status">{o.status}</td>
				<td>{new Date(o.createdAt).toLocaleDateString()}</td>
			</tr>
		{:else}
			<tr><td colspan="7" class="muted">No orders yet.</td></tr>
		{/each}
	</tbody>
</table>

<style>
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.85rem;
	}
	th,
	td {
		text-align: left;
		padding: 0.6rem 0.5rem;
		border-bottom: 1px solid #eee;
	}
	.status {
		text-transform: capitalize;
		font-weight: 600;
		color: #0d7a5f;
	}
	.muted {
		color: #888;
	}
</style>
