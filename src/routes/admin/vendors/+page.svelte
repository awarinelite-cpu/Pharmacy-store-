<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<h1>Vendors</h1>

<table>
	<thead>
		<tr>
			<th>Business</th>
			<th>Contact</th>
			<th>Phone</th>
			<th>Status</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
		{#each data.vendors as v (v.uid)}
			<tr>
				<td>{v.businessName ?? v.name}</td>
				<td>{v.email}</td>
				<td>{v.phone ?? '—'}</td>
				<td class:approved={v.vendorApproved}>{v.vendorApproved ? 'Approved' : 'Pending'}</td>
				<td>
					<form method="POST" action="?/setApproval" use:enhance>
						<input type="hidden" name="uid" value={v.uid} />
						<input type="hidden" name="approved" value={String(!v.vendorApproved)} />
						<button type="submit">{v.vendorApproved ? 'Revoke' : 'Approve'}</button>
					</form>
				</td>
			</tr>
		{:else}
			<tr><td colspan="5" class="muted">No vendor signups yet.</td></tr>
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
	.approved {
		color: #0d7a5f;
		font-weight: 600;
	}
	button {
		border: 1px solid #ccc;
		background: white;
		border-radius: 6px;
		padding: 0.3rem 0.7rem;
		cursor: pointer;
		font-size: 0.8rem;
	}
	.muted {
		color: #888;
	}
</style>
