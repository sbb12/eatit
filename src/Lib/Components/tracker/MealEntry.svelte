<script lang="ts">

    import { pb } from '../../pb/pocketbase';
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();
    
    export let meal: any;
    let id: string = meal.id; 
    let food = meal.food;
    let quantity: number = meal.quantity;
    let measure: string = meal.measure;
    let calories: number = meal.calories;    
    let options = food.options;

    function deleteEntry() {
        pb.collection('meal_entry').delete(id)
        dispatch('removeMeal', {id});
    }    

    async function updateMeal() {
        calories = quantity * options.find((option: any) => option.measure == measure).calories;
        calories = Math.round(calories);
        const data = {
            quantity: quantity,
            measure: measure,
            calories: calories
        }
        pb.collection('meal_entry').update(id, data);
        
        dispatch('updateMeal', {id, quantity, measure, calories})
    }

    onMount(() => {
    })
    
</script>

<div class="meal-entry grid grid-cols-8 w-full rounded-sm items-center">
    <img src="{`https://pb.surgo.dev/api/files/${food.collectionId}/${food.id}/${food.image}?thumb=50x50`}" alt='placeholder' class="col-span-1 p-1 w-[50px] h-[50px]"/>
    <p class="font-semibold text-sm col-span-3 p-1 ">{meal.name}</p>  
    <input type="number" class="col-span-1 w-[40px] bg-gray-100 focus:outline-none" bind:value={quantity} on:input={updateMeal}/>
    <select class="col-span-1 m-[-1rem] bg-gray-100" bind:value={measure} on:change={updateMeal}>
            {#each options as option}
                <option value="{option.measure}" title="{option.desc ? option.desc : ''}">{option.measure}</option>
            {/each}
    </select>
    <p class="col-span-1 ml-auto text-lg font-semibold text-purple-500">{calories}  <span class="text-md text-slate-600 font-normal"></span></p>
    
    <div class="col-span-1 mx-auto">
        <button on:click={deleteEntry} class="">❌</button>
    </div>

</div>