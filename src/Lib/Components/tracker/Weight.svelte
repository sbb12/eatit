<script lang='ts'>
    import { pb } from '../../pb/pocketbase';
    import { createEventDispatcher } from 'svelte';
    
    export let weight: number|null = null;
    export let id: string;

    async function submitWeight() {
       
        const weightInput = document.getElementById('submit-weight');
        weightInput?.classList.add('hidden');

        pb.collection('day_track').update(id, {
            weight: weight
        })
    }

    function revealWeightForm(){
        const weightInput = document.getElementById('submit-weight');
        weightInput?.classList.remove('hidden');
    }
    
</script>

<div class="text-lg font-medium">
    {#if !weight}
        <h1 on:click={revealWeightForm} on:keypress={() => {}}>enter weight?</h1>
    {:else}
        <h1>{weight} kg</h1>
    {/if}
    <form id="submit-weight" class="hidden" on:submit|preventDefault={submitWeight} >
        <input type="text" class =" w-24" bind:value={weight}>
        <button type="submit">Submit</button>
    </form>
</div>
