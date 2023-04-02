<script lang="ts">
    import "../app.css";
    import Nav from "../lib/components/Nav.svelte";
    import Login from "../lib/components/Login.svelte";
    import { currentUser, pb } from "../lib/pb/pocketbase";
	import { onMount } from "svelte";

    // const authData = pb.collection('users').authRefresh();
    let test = 'test';

    onMount(()=>{
        if (!('BarcodeDetector' in window)) {
            test = 'false'
        } else {
            test = 'true'
        }
    })

</script>

<!-- {#await authData then data} -->
    {test}


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

