<script lang="ts">

    import { pb } from '../pb/pocketbase';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let dayID: string;
    let name:string = '';
    let calories:number = 0;    
    let adding: boolean = false;
    let foods: any[] = [];

    $: {name, searchFoods()}

    async function searchFoods() {
        if (name.length < 1) {
            foods = [];
            return;
        } 
        try {
            const results = await pb.collection('foods').getList(1, 15, {
                filter: 'name ~ "' + name + '"',
                sort: 'created'
            })
            foods = results.items;
            console.log(foods)
        } catch (error) {
            console.log(error)
        }
    }

    async function addMeal() {
        const data={
            name: name,
            calories: calories,
            day: dayID
        }
        try {
            const newMeal = await pb.collection('meal_entry').create(data);
            dispatch('addMeal', newMeal);
        } catch (error) {
            console.log(error);
        }
        adding = false;
        name = '';
        calories = 0;
    }

</script>


<div class="flex w-full justify-center">
    {#if !adding}
     <div on:mousedown={() => adding = true}>
        <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.25 13.25C5.25 9.47876 5.25 7.59315 6.42157 6.42157C7.59315 5.25 9.47876 5.25 13.25 5.25H28.75C32.5212 5.25 34.4069 5.25 35.5784 6.42157C36.75 7.59315 36.75 9.47876 36.75 13.25V28.75C36.75 32.5212 36.75 34.4069 35.5784 35.5784C34.4069 36.75 32.5212 36.75 28.75 36.75H13.25C9.47876 36.75 7.59315 36.75 6.42157 35.5784C5.25 34.4069 5.25 32.5212 5.25 28.75V13.25Z" stroke="rgb(168 85 247)" stroke-width="2"/>
            <path d="M21 14L21 28" stroke="rgb(168 85 247)" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"/>
            <path d="M28 21L14 21" stroke="rgb(168 85 247)" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"/>
        </svg>
    </div>
    {:else}
    <div class="flex flex-col">

        <div class="inline-flex">
            <form on:submit|preventDefault={addMeal} >
                <input type="text" placeholder="name" bind:value={name} class="px-1">
                <input type="number" placeholder="cal" bind:value={calories}>
                <button type="submit" >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" class="w-10 h-10">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </form>
            <button type="button" on:click={() => adding = false}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="darkred" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <ul class="flex flex-col items-center w-full">
            {#each foods as food}
            <li class="border inline-flex justify-between w-full px-2 py-1 my-1" title="{food.description}">
                    <p>
                        {food.name}
                    </p>
                    <div class="inline-flex items-center">
                        {food.cal}cal
                        <button type="button" class="pl-2" on:click={ () => { name=food.name, calories=food.cal, addMeal()}} on:keypress>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                        
                    </div>
            </li>
            {/each}
        </ul>
    </div>
    {/if}
</div>




<style>
    form {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        border-radius: 4px;
        padding: 2px;
        border: 1px solid black;
    }

    /* input type number */
    input[type=number]{
        padding: 5px;
        width: 50px
    }

</style>