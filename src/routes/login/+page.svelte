<script>
	import { onMount } from "svelte";
    import Login from "./Login.svelte";
    import { currentUser } from "$lib/pb/pocketbase";
	import { goto } from "$app/navigation";

    onMount(() => {
        if ($currentUser) {
            goto('/track')
        }
    })    
</script>

{#if $currentUser}
    <div class="p-10 w-full">
        <h1 class="text-center">Already logged in, redirecting...</h1>
    </div>
{:else}
    <Login />
{/if}