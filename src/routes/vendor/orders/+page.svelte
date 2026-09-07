<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const nextActions: Record<string, { label: string; status: string }[]> = {
		paid: [
			{ label: 'Start processing', status: 'processing' },
			{ label: 'Cancel', status: 'cancelled' }
		],
		processing: [
			{ label: 'Mark fulfilled', status: 'fulfilled' },
			{ label: 'Cancel', status: 'cancelled' }
		]
	};
</script>

<h1>Orders</h1>

{#if form?.error}
	<p class="error">{form.error}</p>
{/if}

<table>
	<thead>
		<tr>
			<th>Order</th>
			<th>Customer</th>
			<th>Items</th>
			<th>Total</th>
			<th>Status</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
		{#each data.orders as o (o.id)}
			<tr>
				<td>#{o.id.slice(0, 6)}</td>
				<td>{o.customerName}</td>
				<td>{o.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</td>
				<td>₦{(o.subtotal / 100).toLocaleString()}</td>
				<td class="status">{o.status}</td>
				<td>
					{#each nextActions[o.status] ?? [] as action (action.status)}
						<form method="POST" action="?/updateStatus" use:enhance class="inline-form">
							<input type="hidden" name="orderId" value={o.id} />
							<input type="hidden" name="status" value={action.status} />
							<button type="submit">{action.label}</button>
						</form>
					{/each}
				</td>
			</tr>
		{:else}
			<tr><td colspan="6" class="muted">No orders yet.</td></tr>
		{/each}
	</tbody>
</table>

<style>
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
	.status {
		text-transform: capitalize;
		font-weight: 600;
		color: #0d7a5f;
	}
	.inline-form {
		display: inline;
	}
	button {
		border: 1px solid #ccc;
		background: white;
		border-radius: 6px;
		padding: 0.3rem 0.6rem;
		cursor: pointer;
		font-size: 0.8rem;
		margin-right: 0.3rem;
	}
	.muted {
		color: #888;
	}
	.error {
		color: #b3261e;
	}
</style>
