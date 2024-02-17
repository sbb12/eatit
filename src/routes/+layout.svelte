<script lang="ts">
    
	import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { pb } from "$lib/pb/pocketbase";
    import Nav from "$lib/components/Nav.svelte";
    import "../app.css";

    onMount(async () => {
        try {
            // validate server-side the auth state
            pb.authStore.isValid && await pb.collection('users').authRefresh();
        } catch (error) {
            pb.authStore.clear();
        }

        if (!pb.authStore.isValid) {
            pb.authStore.clear()
            await goto('/login');
        }
    });
    
</script>

<Nav />
<slot />

