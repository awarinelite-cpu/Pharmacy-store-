<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showAddForm = $state(false);
</script>

<div class="inventory-page">
	<div class="header-row">
		<h1>Inventory</h1>
		<button class="primary" onclick={() => (showAddForm = !showAddForm)}>
			{showAddForm ? 'Cancel' : '+ Add product'}
		</button>
	</div>

	{#if form?.error}
		<p class="error">{form.error}</p>
	{/if}

	{#if showAddForm}
		<form method="POST" action="?/create" use:enhance class="add-form">
			<div class="grid">
				<label>
					Product name
					<input name="name" required />
				</label>
				<label>
					Generic name
					<input name="genericName" />
				</label>
				<label>
					Category
					<input name="category" required placeholder="e.g. Antibiotics" />
				</label>
				<label>
					Unit
					<input name="unit" placeholder="tablet, bottle, pack" value="unit" />
				</label>
				<label>
					Price (₦)
					<input name="price" type="number" step="0.01" min="0.01" required />
				</label>
				<label>
					Opening stock qty
					<input name="stockQty" type="number" min="0" required value="0" />
				</label>
				<label>
					Batch number
					<input name="batchNumber" />
				</label>
				<label>
					Expiry date
					<input name="expiryDate" type="date" />
				</label>
			</div>
			<label class="checkbox">
				<input name="prescriptionRequired" type="checkbox" />
				Requires prescription
			</label>
			<button type="submit" class="primary">Save product</button>
		</form>
	{/if}

	<table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Category</th>
				<th>Price</th>
				<th>Stock</th>
				<th>Status</th>
				<th>Adjust stock</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each data.products as p (p.id)}
				<tr class:inactive={!p.active}>
					<td>
						<strong>{p.name}</strong>
						{#if p.genericName}<div class="muted">{p.genericName}</div>{/if}
					</td>
					<td>{p.category}</td>
					<td>₦{(p.price / 100).toLocaleString()}</td>
					<td class:low={p.stockQty <= 5}>{p.stockQty} {p.unit}</td>
					<td>{p.active ? 'Active' : 'Hidden'}</td>
					<td>
						<form method="POST" action="?/adjustStock" use:enhance class="inline-form">
							<input type="hidden" name="productId" value={p.id} />
							<input name="delta" type="number" placeholder="±qty" required class="small" />
							<input name="reason" placeholder="reason" class="small" />
							<button type="submit">Apply</button>
						</form>
					</td>
					<td class="row-actions">
						<form method="POST" action="?/toggleActive" use:enhance>
							<input type="hidden" name="productId" value={p.id} />
							<input type="hidden" name="active" value={String(p.active)} />
							<button type="submit">{p.active ? 'Hide' : 'Show'}</button>
						</form>
						<form method="POST" action="?/delete" use:enhance>
							<input type="hidden" name="productId" value={p.id} />
							<button type="submit" class="danger">Delete</button>
						</form>
					</td>
				</tr>
			{:else}
				<tr><td colspan="7" class="muted">No products yet. Add your first one above.</td></tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}
	.primary {
		background: #0d7a5f;
		color: white;
		border: none;
		border-radius: 6px;
		padding: 0.6rem 1rem;
		cursor: pointer;
		font-weight: 600;
	}
	.add-form {
		border: 1px solid #eee;
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 0.75rem;
	}
	.grid label,
	.checkbox {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.85rem;
	}
	.checkbox {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}
	input {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 6px;
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
		font-size: 0.8rem;
	}
	.inline-form {
		display: flex;
		gap: 0.3rem;
	}
	.small {
		width: 70px;
	}
	.row-actions {
		display: flex;
		gap: 0.4rem;
	}
	.danger {
		color: #b3261e;
		border-color: #b3261e;
	}
	button {
		border: 1px solid #ccc;
		background: white;
		border-radius: 6px;
		padding: 0.4rem 0.6rem;
		cursor: pointer;
		font-size: 0.8rem;
	}
	.error {
		color: #b3261e;
		margin-bottom: 1rem;
	}
</style>
