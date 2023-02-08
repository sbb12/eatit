<script>
    // import '@picocss/pico';
    import "../app.css";
    
    import Nav from "../Lib/Components/Nav.svelte";
    import Login from "../Lib/Components/Login.svelte";
    import { currentUser } from "../Lib/pb/pocketbase";
</script>

{#if !$currentUser }
    <Login />
{:else}
    <Nav />
    <slot />
{/if}
