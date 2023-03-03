<script lang="ts">
    import "../app.css";
    import Nav from "../lib/components/Nav.svelte";
    import Login from "../lib/components/Login.svelte";
    import { currentUser, pb } from "../lib/pb/pocketbase";

    // const authData = pb.collection('users').authRefresh();
</script>

<!-- {#await authData then data} -->
    {#if !$currentUser }
        <Login />
    {:else}
        <Nav />
        <slot />
    {/if}
<!-- {:catch error}
    <div class="error">
        {error.message}
    </div>
{/await} -->

