<script>
	import { onMount } from "svelte";
    import Login from "../../lib/components/Login.svelte";
    import { currentUser } from "../../lib/pb/pocketbase";

    onMount(() => {
        if ($currentUser) {
            window.location.href = '/track'
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