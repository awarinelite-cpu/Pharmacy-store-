<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<h1>Admin dashboard</h1>

<div class="cards">
	<div class="card"><span class="num">{data.vendorCount}</span><span class="label">Vendors</span></div>
	<div class="card warn">
		<span class="num">{data.pendingVendorCount}</span>
		<span class="label">Pending approval</span>
	</div>
	<div class="card"><span class="num">{data.customerCount}</span><span class="label">Customers</span></div>
	<div class="card"><span class="num">{data.productCount}</span><span class="label">Products</span></div>
	<div class="card"><span class="num">{data.orderCount}</span><span class="label">Orders</span></div>
</div>

<nav class="admin-nav">
	<a href="/admin/vendors">Manage vendors</a>
	<a href="/admin/products">All products</a>
	<a href="/admin/orders">All orders</a>
	<a href="/admin/users">All users</a>
</nav>

<style>
	.cards {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin: 1rem 0 2rem;
	}
	.card {
		border: 1px solid #eee;
		border-radius: 8px;
		padding: 1rem 1.5rem;
		display: flex;
		flex-direction: column;
		min-width: 130px;
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
	.admin-nav {
		display: flex;
		gap: 1rem;
	}
	.admin-nav a {
		padding: 0.5rem 0.9rem;
		border: 1px solid #ccc;
		border-radius: 6px;
		text-decoration: none;
		color: #333;
		font-size: 0.9rem;
	}
</style>
