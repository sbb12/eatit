<script lang='ts'>
    import { pb } from '../../pb/pocketbase';
    
    export let weight: number|null = null;
    export let id: string;

    $: id, loadWeight();

    async function loadWeight() {
        try {
            const record = await pb.collection('day_track').getOne(id, {});
            weight = record.weight;
            if (!weight) weight = null;
        } catch (e) {
            weight = null;
        }
    }

    async function submitWeight() {
        pb.collection('day_track').update(id, {
            weight: weight
        })
    }
    
</script>

<form class="text-lg font-medium">
        <input type="number" bind:value={weight} placeholder='weight' on:change={submitWeight} 
            class="w-20 px-1 mx-1 bg-transparent text-right cursor-pointer"/>
        <span class="">kg</span>
</form>
