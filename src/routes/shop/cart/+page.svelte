<script lang="ts">
	import { cart } from '$lib/stores/cart';
	import { goto } from '$app/navigation';

	let total = $derived($cart.reduce((sum, l) => sum + l.unitPrice * l.qty, 0));

	function proceed() {
		goto('/shop/checkout');
	}
</script>

<h1>Your cart</h1>

{#if $cart.length === 0}
	<p class="muted">Your cart is empty. <a href="/shop">Browse products</a></p>
{:else}
	<table>
		<thead>
			<tr>
				<th>Product</th>
				<th>Vendor</th>
				<th>Price</th>
				<th>Qty</th>
				<th>Subtotal</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each $cart as line (line.productId)}
				<tr>
					<td>{line.name}</td>
					<td class="muted">{line.vendorName}</td>
					<td>₦{(line.unitPrice / 100).toLocaleString()}</td>
					<td>
						<input
							type="number"
							min="1"
							max={line.maxQty}
							value={line.qty}
							onchange={(e) => cart.setQty(line.productId, Number(e.currentTarget.value))}
						/>
					</td>
					<td>₦{((line.unitPrice * line.qty) / 100).toLocaleString()}</td>
					<td><button onclick={() => cart.remove(line.productId)}>Remove</button></td>
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="total-row">
		<span>Total</span>
		<strong>₦{(total / 100).toLocaleString()}</strong>
	</div>

	<button class="checkout" onclick={proceed}>Proceed to checkout</button>
{/if}

<style>
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}
	th,
	td {
		text-align: left;
		padding: 0.6rem 0.5rem;
		border-bottom: 1px solid #eee;
	}
	input[type='number'] {
		width: 60px;
		padding: 0.3rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
	.total-row {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		font-size: 1.1rem;
		margin: 1rem 0;
	}
	.checkout {
		float: right;
		padding: 0.7rem 1.4rem;
		border: none;
		border-radius: 6px;
		background: #0d7a5f;
		color: white;
		font-weight: 600;
		cursor: pointer;
	}
	.muted {
		color: #888;
	}
	button {
		border: 1px solid #ccc;
		background: white;
		border-radius: 6px;
		padding: 0.3rem 0.6rem;
		cursor: pointer;
		font-size: 0.8rem;
	}
</style>
