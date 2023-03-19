<script lang="ts">

    import { pb } from '../../pb/pocketbase';
    import FoodOption from './FoodOption.svelte';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let dayID: string;
    let name:string = '';
    let adding: boolean = false;
    let foods: any[] = [];

    let quickName: string = '';
    let quickQuantity: number;

    $: {name, searchFoods()}

    let addEl: HTMLElement;

    async function searchFoods() {
        if (name.length < 1) {
            foods = [];
            return;
        } 
        foods = [];
        try {
            const results = await pb.collection('foods_basic').getList(1, 15, {
                filter: 'name ~ "' + name + '"',
                sort: 'created'
            })
            foods = results.items.map((food) => {
                return {
                    id: food.id,
                    image: food.image,
                    name: food.name,
                    options: food.options
                }
            });
        } catch (error) {
            console.log(error)
        }
    }

    async function getFood(id: string){
        try{
            const food = await pb.collection('foods_basic').getOne(id, {});
            return food;
        } catch (error) {
            console.log(error)
            return false;
        }
    }

    async function quickAdd(){

        const food = await getFood('3lp4ntv6p0efkmn'); // id of basic food
        if (!food) {
            console.log("couldn't fetch quick cal food data")
            return;
        }

        const data = {
            name: quickName,
            food_id: '3lp4ntv6p0efkmn',
            quantity: quickQuantity,
            measure: 'cal',
            calories: Math.round(quickQuantity * JSON.parse(food.options)[0].cal),
            day: dayID
        }

        try {
            const newEntry = await pb.collection('meal_entry').create(data);
            name = '';
            quickName = '';
            adding = false;
            dispatch('addMeal', {
                entry: newEntry,
                food: food
            });           
        } catch (error) {
            console.log(error);
        }

    }

    async function addMeal(event: any) {

        console.log('newmeal', event.detail)

        const data = {
            name: event.detail.name,
            food_id: event.detail.id,
            quantity: event.detail.quantity,
            measure: event.detail.measure,
            calories: Math.round(event.detail.calories),    
            protein: Math.round(event.detail.protein),
            carbs: Math.round(event.detail.carbs),
            fat: Math.round(event.detail.fat),
            cost: parseFloat(event.detail.cost.toFixed(2)),
            day: dayID
        }

        try {
            const newEntry = await pb.collection('meal_entry').create(data);
            name = '';
            adding = false;
            dispatch('addMeal', {
                entry: newEntry,
                food: event.detail.food
            });
            
        } catch (error) {
            console.log(error);
        }
    }

</script>


<div class="flex w-full justify-center" bind:this={addEl}>
    {#if !adding}
     <div on:mousedown={() => {adding = true;  console.log('scroll'); addEl.scrollIntoView()}}>
        <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.25 13.25C5.25 9.47876 5.25 7.59315 6.42157 6.42157C7.59315 5.25 9.47876 5.25 13.25 5.25H28.75C32.5212 5.25 34.4069 5.25 35.5784 6.42157C36.75 7.59315 36.75 9.47876 36.75 13.25V28.75C36.75 32.5212 36.75 34.4069 35.5784 35.5784C34.4069 36.75 32.5212 36.75 28.75 36.75H13.25C9.47876 36.75 7.59315 36.75 6.42157 35.5784C5.25 34.4069 5.25 32.5212 5.25 28.75V13.25Z" stroke="rgb(168 85 247)" stroke-width="2"/>
            <path d="M21 14L21 28" stroke="rgb(168 85 247)" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"/>
            <path d="M28 21L14 21" stroke="rgb(168 85 247)" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"/>
        </svg>
    </div>
    {:else}
    <div class="flex flex-col">

        <div class="flex flex-col">
            <form on:submit|preventDefault={quickAdd} class="grid grid-cols-7">
                <h2 class="col-span-7 p-2 mx-auto">Quick Add Food</h2>
                <input type="text" placeholder="name" bind:value={quickName} class="col-span-4 p-2 rounded outline-none drop-shadow-sm focus:drop-shadow-lg">
                <input type="number" placeholder="calories" bind:value="{quickQuantity}" class="p-2 col-span-2 mx-2 rounded outline-none drop-shadow-sm focus:drop-shadow-lg">
                <button type="button"  on:click={ quickAdd } on:keypress class="mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </form>

            <form on:submit|preventDefault={addMeal} class="grid grid-cols-7">
                <h2 class="col-span-7 p-2 mx-auto">Search from DB</h2>
                <input type="text" placeholder="search by name" bind:value={name} class="col-span-7 p-2 rounded outline-none drop-shadow-sm focus:drop-shadow-lg">
                
                {#if foods.length > 0}
                    <ul class="col-span-full">
                        {#each foods as food}
                            <FoodOption {food} on:addMeal={addMeal}/>
                        {/each}
                    </ul>
                {/if}
            </form>
        </div>
    </div>
    {/if}
</div>



<style>
    
</style>