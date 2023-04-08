<script lang="ts">
    import { currentUser, pb } from "../../lib/pb/pocketbase";
    import { onMount } from "svelte";   
    let msg: string = '';

    let records: any[] = [];

    onMount(async () => {
        let records = await pb.collection('foods_basic').getFullList(200)         
    })


</script>

<h1>
    Secret Page
    {$currentUser}
</h1>

<p>{msg}</p>