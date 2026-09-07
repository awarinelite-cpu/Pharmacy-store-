<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<h1>Users</h1>

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Email</th>
			<th>Role</th>
			<th>Status</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
		{#each data.users as u (u.uid)}
			<tr class:disabled={u.disabled}>
				<td>{u.name}</td>
				<td>{u.email}</td>
				<td class="role">{u.role}</td>
				<td>{u.disabled ? 'Disabled' : 'Active'}</td>
				<td>
					{#if u.role !== 'admin'}
						<form method="POST" action="?/disable" use:enhance>
							<input type="hidden" name="uid" value={u.uid} />
							<input type="hidden" name="disabled" value={String(!u.disabled)} />
							<button type="submit">{u.disabled ? 'Enable' : 'Disable'}</button>
						</form>
					{/if}
				</td>
			</tr>
		{:else}
			<tr><td colspan="5" class="muted">No users yet.</td></tr>
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
	tr.disabled {
		opacity: 0.5;
	}
	.role {
		text-transform: capitalize;
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
