<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<h1>My orders</h1>

{#if data.orders.length === 0}
	<p class="muted">No orders yet. <a href="/shop">Start shopping</a></p>
{:else}
	<div class="orders">
		{#each data.orders as o (o.id)}
			<div class="order-card">
				<div class="order-header">
					<span>#{o.id.slice(0, 6)}</span>
					<span class="status">{o.status}</span>
				</div>
				<ul>
					{#each o.items as item (item.productId)}
						<li>{item.qty}× {item.name} — ₦{((item.unitPrice * item.qty) / 100).toLocaleString()}</li>
					{/each}
				</ul>
				<div class="order-footer">
					<span>Total: ₦{(o.subtotal / 100).toLocaleString()}</span>
					<span class="muted">{new Date(o.createdAt).toLocaleDateString()}</span>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.orders {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 480px;
	}
	.order-card {
		border: 1px solid #eee;
		border-radius: 8px;
		padding: 1rem;
	}
	.order-header {
		display: flex;
		justify-content: space-between;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}
	.status {
		text-transform: capitalize;
		color: #0d7a5f;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0 0 0.5rem;
		font-size: 0.85rem;
	}
	li {
		padding: 0.15rem 0;
	}
	.order-footer {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
	}
	.muted {
		color: #888;
	}
</style>
