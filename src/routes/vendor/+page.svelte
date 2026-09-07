<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<h1>Vendor dashboard</h1>

<div class="cards">
	<div class="card">
		<span class="num">{data.totalProducts}</span>
		<span class="label">Products listed</span>
	</div>
	<div class="card">
		<span class="num">{data.pendingOrdersCount}</span>
		<span class="label">Orders to fulfill</span>
	</div>
	<div class="card warn">
		<span class="num">{data.lowStock.length}</span>
		<span class="label">Low stock items</span>
	</div>
</div>

{#if data.lowStock.length}
	<section>
		<h2>Low stock</h2>
		<ul>
			{#each data.lowStock as p (p.id)}
				<li>{p.name} — {p.stockQty} {p.unit} left</li>
			{/each}
		</ul>
	</section>
{/if}

<section>
	<h2>Recent orders</h2>
	{#if data.recentOrders.length === 0}
		<p class="muted">No orders yet.</p>
	{:else}
		<ul>
			{#each data.recentOrders as o (o.id)}
				<li>
					<strong>#{o.id.slice(0, 6)}</strong> — {o.customerName} — ₦{(o.subtotal / 100).toLocaleString()}
					— <span class="status">{o.status}</span>
				</li>
			{/each}
		</ul>
	{/if}
	<a href="/vendor/orders">View all orders →</a>
</section>

<style>
	.cards {
		display: flex;
		gap: 1rem;
		margin: 1rem 0 2rem;
	}
	.card {
		border: 1px solid #eee;
		border-radius: 8px;
		padding: 1rem 1.5rem;
		display: flex;
		flex-direction: column;
		min-width: 140px;
	}
	.card.warn {
		border-color: #f0c46a;
		background: #fff9ec;
	}
	.num {
		font-size: 1.8rem;
		font-weight: 700;
	}
	.label {
		font-size: 0.8rem;
		color: #888;
	}
	section {
		margin-bottom: 2rem;
	}
	ul {
		list-style: none;
		padding: 0;
	}
	li {
		padding: 0.4rem 0;
		border-bottom: 1px solid #f2f2f2;
		font-size: 0.9rem;
	}
	.status {
		text-transform: capitalize;
		color: #0d7a5f;
		font-weight: 600;
	}
	.muted {
		color: #888;
	}
</style>
