<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let food: any;
    let quantity: number = 1;
    
    const options = JSON.parse(food.options);
    let measure = options[0].measure;
    $: calories = quantity * options.find((option: any) => option.measure === measure).cal;



    function addMeal() {
        dispatch('addMeal', {
            name: food.name,
            id: food.id, 
            quantity: quantity, 
            measure: measure,
            calories: quantity * options.find((option: any) => option.measure === measure).cal,
            food:food
        })
    }

</script>


<div class="grid grid-cols-8 items-center">
    <img src="{food.image}" alt='placeholder' class="col-span-1 p-1 w-[50px] h-[50px]"/>
    <p class="col-span-3 p-1">{food.name}</p>  
    <input type="number" placeholder="qty" bind:value={quantity} class="px-1 mr-2 focus:outline-none h-6 rounded-sm drop-shadow">
    <select class="col-span-1 focus:outline-none h-6 mr-[-20px] rounded-sm drop-shadow" bind:value={measure}>
        {#each options as option}
                <option value="{option.measure}" title="{option.desc ? option.desc : ''}" >
                    {option.measure}
                </option>
        {/each}
    </select>
    <p class="ml-auto text-purple-500 font-bold">{calories}</p>
    <button type="button"  on:click={ addMeal } on:keypress class="mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    </button>
</div>