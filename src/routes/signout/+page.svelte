<script lang="ts">
    import { onMount } from "svelte";
    import { pb } from "../../lib/pb/pocketbase";
    
    onMount(async () => {
        await pb.authStore.clear();
        window.location.href = "/login";
    });

</script>