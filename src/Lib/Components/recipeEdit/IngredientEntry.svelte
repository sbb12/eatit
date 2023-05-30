<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let food: {id: string, name: string, image: string, collectionId: string, options: any[], brands: string};
    export let name: string;
    export let quantity: number;
    export let measure: string;

    const options = food.options
    const image = `https://pb.sercan.co.uk/api/files/${food.collectionId}/${food.id}/${food.image}`

    let calories: number = 0;
    $: calories =  Math.round(quantity * options.find((option: any) => option.measure === measure).calories), updateNumbers();

    function removeIngredient(){
        dispatch('removeIngredient', food.id)
    }

    function updateNumbers(){
        dispatch('updateNumbers', {id: food.id, quantity: quantity, measure: measure})
    }

</script>





<div class="grid grid-cols-8 items-center">
    <img src="{image}?thumb=50x50" alt='placeholder' class="col-span-1 " height="45px" width="45px" title="{food.brands}"/>
    <p class="col-span-3 p-1 text-sm" title="{food.brands}">{name}</p>  
    <input type="number" placeholder="qty" bind:value={quantity} class="px-1 mr-2 focus:outline-none h-6 rounded-sm drop-shadow text-sm" on:change={updateNumbers}>
    <select class="col-span-1 focus:outline-none h-6 mr-[-20px] rounded-sm drop-shadow text-sm" bind:value={measure} on:change={updateNumbers}>
        {#each options as option (option)}
                <option value="{option.measure}" title="{option.desc ? option.desc : ''}" >
                    {option.measure}
                </option>
        {/each}
    </select>
    <p class="ml-auto text-purple-500 font-bold">{calories}</p>
    <button title="Close" on:click={removeIngredient} class="addTypeIcon p-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="darkred" class="bi bi-x ml-auto" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg>
    </button>
</div>