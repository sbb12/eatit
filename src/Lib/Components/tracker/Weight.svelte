<script lang='ts'>
    import { pb } from '../../pb/pocketbase';
    
    export let weight: number|null = null;
    export let id: string;

    let inputEl: HTMLInputElement;
    let showWeight: boolean = false;

    if (weight){
        showWeight = true;
    }

    async function submitWeight() {
        pb.collection('day_track').update(id, {
            weight: weight
        })
    }

    function handleClick() {
        showWeight = true;
        weight = null;
        setTimeout(() => {
            inputEl.focus();
        }, 100);
    }

    
    
</script>

<div class="text-lg font-medium">
        <h1 on:click={handleClick} on:keypress class = {showWeight ? 'hidden' : ''}>enter weight</h1>
        <input bind:this={inputEl} type="number"  bind:value={weight} placeholder='weight' on:change={submitWeight} class="w-20 px-1 mx-1 bg-transparent text-right cursor-pointer {showWeight ? '' : 'hidden'}"><span class="{showWeight ? '' : 'hidden'}">kg</span>
</div>
