<script lang='ts'>
	// The ordering of these imports is critical to your app working properly
	import '@skeletonlabs/skeleton/themes/theme-crimson.css';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';
	import {AppShell, AppBar, Modal} from '@skeletonlabs/skeleton';

	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import {modalComponentRegistry} from "$lib/misc/modalComponentRegistry";

	// Create a store and update it when necessary...
	const userState = writable();
	// ...and add it to the context for child components to access
	setContext('user', userState);

	// Subscribe to the store and update the token and isLoggedIn variables when it changes
	$: userState.subscribe((userState) => {
		if (userState) {
			displayName = userState.user.displayName;
			token = userState.token;
			isLoggedIn = true;
		} else {
			displayName = '';
			token = null;
			isLoggedIn = false;
		}
	});

	let displayName = '';
	let token = null;
	let isLoggedIn = false;
</script>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<strong class="text-xl uppercase">Prompt Management</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				{#if !isLoggedIn}
					<a
							class="btn btn-sm variant-ghost-surface"
							href="/login"
					>
						Login
					</a>
					<a
							class="btn btn-sm variant-ghost-surface"
							href="/register"
					>
						Register
					</a>
				{:else}
					{displayName}
					<a
							class="btn btn-sm variant-ghost-surface"
							href="/login" on:click={() => userState.set(null)}
					>
						Logout
					</a>
				{/if}
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>

<Modal components={modalComponentRegistry} />
