<script lang="ts">
    import { currentUser, pb } from "../lib/pb/pocketbase";
    import { redirect } from "@sveltejs/kit";
    import { onMount } from "svelte";
    import Login from "../lib/components/Login.svelte";

    if ($currentUser){
        window.location.href = '/track'
    }
</script>

{#if !$currentUser}
    <Login />
{/if}




