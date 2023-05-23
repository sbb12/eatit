<script lang="ts">

    import { pb } from '../../pb/pocketbase';
    import FoodOption from './FoodOption.svelte';
    import BarcodeHandler from '../scanner/BarcodeHandler.svelte';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let dayID: string;
    let name:string = '';
    let adding: boolean = false;
    let foods_results: any[] = [];
    let foods: any[] = [];

    let addType: string = 'db';
    let includeBasic: boolean = true;
    let includeBranded: boolean = true;
    let includeRecipe: boolean = true;
    let filterOpen: boolean = false;

    let quickName: string = '';
    let quickQuantity: number|null;

    $: {name, searchFoods()}
    $: {includeBasic, includeBranded, includeRecipe, filterFoodsByIncludes()}

    let addEl: HTMLElement;

    async function searchFoods() {
        if (name.length < 1) {
            foods = [];
            return;
        } 
        foods = [];
        try {
            // get records
            foods_results = await pb.collection('foods').getList(1, 15, {
                filter: 'name ~ "' + name + '" || brands ~ "' + name + '"',
                sort: 'created'
            })            

            foods_results = foods_results.items.sort((a: any, b: any) => {
                const pattern = new RegExp(name, 'g');
                
                const occursA =  a.name.match(pattern)?.length || 0;
                const occursB =  b.name.match(pattern)?.length || 0;

                const coverA = occursA / a.name.length;
                const coverB = occursB / b.name.length;
                
                return coverB - coverA;
            })            

            filterFoodsByIncludes();

        } catch (error) {
            console.log(error)
        }
    }

    function filterFoodsByIncludes(){
        if (includeBasic && includeBranded && includeRecipe) {
            foods = foods_results;
        }
        foods = foods_results.filter((food: any) => {
            if (food.type === 'basic' && includeBasic) {
                return true;
            }
            if (food.type === 'branded' && includeBranded) {
                return true;
            }
            if (food.type === 'recipe' && includeRecipe) {
                return true;
            }
            return false;
        })
    }

    async function getFood(id: string){
        try{
            const food = await pb.collection('foods').getOne(id, {});
            return food;
        } catch (error) {
            console.log(error)
            return false;
        }
    }

    async function quickAdd(){

        const food = await getFood('448ohrs7rgvbxak'); // id of basic food
        if (!food) {
            console.log("couldn't fetch quick cal food data")
            return;
        }

        const data = {
            day: dayID,
            name: quickName,
            food: '448ohrs7rgvbxak',
            quantity: quickQuantity,
            measure: 'cal',
            calories: quickQuantity,
            protein: 0,
            carbs: 0,
            fat: 0,
            cost: 0,
        }

        try {
            const newEntry = await pb.collection('meal_entry').create(data);
            resetOptions()           

            dispatch('addMeal', {
                entry: newEntry,
                food: food
            });           
        } catch (error) {
            console.log(error);
        }

    }

    async function addMeal(event: any) {

        const data = {
            day: dayID,
            name: event.detail.name,
            food: event.detail.food_id,
            quantity: event.detail.quantity,
            measure: event.detail.measure,
            calories: Math.round(event.detail.calories),    
            protein: Math.round(event.detail.protein),
            carbs: Math.round(event.detail.carbs),
            fat: Math.round(event.detail.fat),
            cost: parseFloat(event.detail.cost).toFixed(2),
        }

        try {
            const newEntry = await pb.collection('meal_entry').create(data);
            resetOptions()
            
            dispatch('addMeal', {
                entry: newEntry,
                food: event.detail.food
            });
            
        } catch (error) {
            console.log(error);
        }
    }

    function swapAddType(type: string){
        addType = type;
        document.querySelectorAll('.addTypeIcon').forEach((el) => {
            el.classList.remove('selected');
        })
        document.querySelector(`button#${type}`)?.classList.add('selected');
    }

    function resetOptions(){
        name = '';
        quickName = '';
        quickQuantity = null;
        adding = false
        addType = 'db';
    }

</script>

<div class="flex w-full justify-center" bind:this={addEl}>
    {#if !adding}
     <div on:mousedown={() => {adding = true; addEl.scrollIntoView()}}>
        <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.25 13.25C5.25 9.47876 5.25 7.59315 6.42157 6.42157C7.59315 5.25 9.47876 5.25 13.25 5.25H28.75C32.5212 5.25 34.4069 5.25 35.5784 6.42157C36.75 7.59315 36.75 9.47876 36.75 13.25V28.75C36.75 32.5212 36.75 34.4069 35.5784 35.5784C34.4069 36.75 32.5212 36.75 28.75 36.75H13.25C9.47876 36.75 7.59315 36.75 6.42157 35.5784C5.25 34.4069 5.25 32.5212 5.25 28.75V13.25Z" stroke="rgb(168 85 247)" stroke-width="2"/>
            <path d="M21 14L21 28" stroke="rgb(168 85 247)" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"/>
            <path d="M28 21L14 21" stroke="rgb(168 85 247)" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"/>
        </svg>
    </div>
    {:else}
    <div class="flex flex-col w-full">
        <div class="inline-flex justify-evenly">
            <button title="Search Database" id="db" on:click={()=>{swapAddType('db')}} class="addTypeIcon selected p-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 8V8C9.18741 10.991 14.8126 10.991 19 8V8V18V18C14.6624 20.4786 9.33755 20.4786 5 18V18V8Z" fill="#7E869E" fill-opacity="0.25"/>
                <ellipse cx="12" cy="7" rx="7" ry="3" stroke="#222222" stroke-width="1.2"/>
                <path d="M5 13C5 13 5 15.3431 5 17C5 18.6569 8.13401 20 12 20C15.866 20 19 18.6569 19 17C19 16.173 19 13 19 13" stroke="#222222" stroke-width="1.2" stroke-linecap="square"/>
                <path d="M5 7C5 7 5 10.3431 5 12C5 13.6569 8.13401 15 12 15C15.866 15 19 13.6569 19 12C19 11.173 19 7 19 7" stroke="#222222" stroke-width="1.2"/>
                </svg>
            </button>
            <button title="Quick Add" id="quick" on:click={()=>swapAddType('quick')} class="addTypeIcon p-1">
                <img src="/imgs/quick_add.webp" alt="placeholder" class="col-span-1 w-[28px] h-[28px]">
            </button>
            <button title="Scan Barcode" id="scan" on:click={()=>{swapAddType('scan')}} class="addTypeIcon p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="555" class="bi bi-upc-scan" viewBox="0 0 16 16">
                <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1h-3zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5zM.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5zM3 4.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-7zm3 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7z"/>
              </svg>
            </button>
            <button title="Close" on:click={()=> adding = false} class="addTypeIcon p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="darkred" class="bi bi-x" viewBox="0 0 16 16">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
            </button>
        </div>

        <div class="flex flex-col w-full">
            {#if addType === 'quick'}
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
            {:else if addType === 'db'}
                <form on:submit|preventDefault={addMeal} class="w-full grid grid-cols-7">
                    <h2 class="col-span-7 p-2 mx-auto">Search from DB</h2>
                    <input type="text" placeholder="search by name" bind:value={name} class="col-span-6 p-2 rounded outline-none drop-shadow-sm focus:drop-shadow-lg">
                    <button class="col-span-1 flex justify-center items-center" on:click={()=>{filterOpen = !filterOpen}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_16_151)">
                            <path d="M21 4V6H20L15 13.5V22H9V13.5L4 6H3V4H21ZM6.404 6L11 12.894V20H13V12.894L17.596 6H6.404Z" fill="#555"/>
                            </g>
                            <defs>
                            <clipPath id="clip0_16_151">
                            <rect width="24" height="24" fill="white"/>
                            </clipPath>
                            </defs>
                        </svg>
                    </button>
                    <div class="col-span-full flex justify-between my-4 px-4 {filterOpen ? '' : 'hidden'}">
                        <label for="">
                            <input type="checkbox" bind:checked={includeBasic}> 
                            Basic foods
                        </label>
                        <label for="">
                            <input type="checkbox" bind:checked={includeBranded}> 
                            Branded products
                        </label>                        
                        <label for="">
                            <input type="checkbox" bind:checked={includeRecipe}> 
                            Recipes
                        </label>
                    </div>
                    
                    {#if foods.length > 0}
                        <ul class="col-span-full">
                            {#each foods as food (food.id)}
                                <FoodOption {food} on:addMeal={addMeal}/>
                            {/each}
                        </ul>
                    {/if}
                </form>
            {:else if addType = "scan"}
                <div class="mx-auto p-3">
                    {#if 'BarcodeDetector' in window}
                        <BarcodeHandler {dayID} startDefault={true} on:foundFood={addMeal}/>
                    {:else}
                        <p class="">Barcode scanning is not supported on your device</p>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
    {/if}
</div>



<style>
    button.selected {
        outline: solid green 1px;
    }
    
</style>