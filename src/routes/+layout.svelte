<script>
    import "../app.css";
    import Nav from "../lib/components/Nav.svelte";
    import Login from "../lib/components/Login.svelte";
    import { currentUser } from "../lib/pb/pocketbase";
</script>

{#if !$currentUser }
    <Login />
{:else}
    <Nav />
    <slot />
{/if}

