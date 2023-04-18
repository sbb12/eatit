<script lang="ts">
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    import { pb } from '../../pb/pocketbase';
	import type { Record } from 'pocketbase';

    import NewIngredient from './NewIngredient.svelte';
    import IngredientEntry from './IngredientEntry.svelte';
    import NewStep from './NewStep.svelte';
    import ImageHandler from '../foodEdit/ImageHandler.svelte';
    import NutritionPie from '../tracker/NutritionPie.svelte';

    import AutoTextArea from '../AutoTextArea.svelte';

    const dispatch = createEventDispatcher();

    export let id: string = '';
    
    let name: string = '';
    let no_servings: number = 1;
    let ingredients: {food:{id:string}, name: string, quantity: number, measure: string}[] = [];
    let instructions: any[] = [];
    let serving_calories: number = 0;
    let serving_protein: number = 0;
    let serving_fat: number = 0;
    let serving_carbs: number = 0;
    let serving_cost: number = 0;
   
    let image: File|null = null;
    let imageChange: boolean = false;
    let imageUrl: string = '';

    let draggedItemIndex: any = null;

    $: ingredients && calcNutrition();
    $: no_servings && calcNutrition();

    onMount(async () => {
        if (id) {
            try {
                const record = await pb.collection('recipes').getOne(id);     


                name = record.name;
                no_servings = record.no_servings;
                imageUrl = `https://pb.surgo.dev/api/files/${record.collectionId}/${record.id}/${record.image}?thumb=120x120`;
                instructions = record.instructions;
                serving_calories = record.serving_calories;
                serving_protein = record.serving_protein;
                serving_fat = record.serving_fat;
                serving_carbs = record.serving_carbs;
                serving_cost = record.serving_cost;

                const promisedIngredients = await Promise.all(record.ingredients.map(async (ingredient: Record) => {
                    const food = await pb.collection('foods').getOne(ingredient.food);
                    return {
                        food: food,
                        name: ingredient.name,
                        quantity: ingredient.quantity,
                        measure: ingredient.measure,
                    };
                }));
                promisedIngredients.forEach((ingredient) => {
                    ingredients = [...ingredients, ingredient];
                });

            } catch (error) {
                dispatch ('error', error)
                console.log(error);
            }
        }
    })

    function calcNutrition(){
        serving_calories = 0;
        serving_protein = 0;
        serving_fat = 0;
        serving_carbs = 0;
        serving_cost = 0;

        ingredients.forEach((ingredient) => {
            const option = ingredient.food.options.find((option) => option.measure === ingredient.measure);

            serving_calories += (option.calories * ingredient.quantity / no_servings);
            serving_protein +=  (option.protein * ingredient.quantity / no_servings );
            serving_fat +=  (option.fat * ingredient.quantity / no_servings );
            serving_carbs +=  (option.carbs * ingredient.quantity / no_servings );
            serving_cost +=  (option.cost * ingredient.quantity / no_servings);
        })

        serving_calories = Math.round(serving_calories);
        serving_protein = Math.round(serving_protein);
        serving_fat = Math.round(serving_fat);
        serving_carbs = Math.round(serving_carbs);
        serving_cost = Math.round(serving_cost * 100) / 100;
    }

    function updateNumbers(e: CustomEvent){
        const id = e.detail.id;
        const quantity = e.detail.quantity;
        const measure = e.detail.measure;

        ingredients = ingredients.map((ingredient) => {
            if (ingredient.food.id === id){
                ingredient.quantity = quantity;
                ingredient.measure = measure;
            }
            return ingredient;
        })
        calcNutrition();

    }

    function addIngredient(event: CustomEvent) {        
        const ingredient = {
            food: event.detail.food,
            name: event.detail.name,
            quantity: event.detail.quantity,
            measure: event.detail.measure,
        }
        ingredients = [...ingredients, ingredient];
    }

    function removeIngredient(event: CustomEvent) {
        ingredients = ingredients.filter((ingredient) => ingredient.food.id !== event.detail);
    }
    

    async function saveRecipe() {

        const ingredientsJson = JSON.stringify(ingredients.map((ingredient) => {
            return {
                food: ingredient.food.id,
                name: ingredient.name,
                quantity: ingredient.quantity,
                measure: ingredient.measure,
            }
        }));
        const instructionsJson = JSON.stringify(instructions);

        
        const formData = new FormData();
        formData.append('name', name);
        formData.append('no_servings', no_servings.toString());
        formData.append('ingredients', ingredientsJson);
        formData.append('instructions', instructionsJson);
        formData.append('serving_calories', serving_calories.toString());
        formData.append('serving_protein', serving_protein.toString());
        formData.append('serving_fat', serving_fat.toString());
        formData.append('serving_carbs', serving_carbs.toString());
        formData.append('serving_cost', serving_cost.toString());

        if (imageChange) {
            formData.append('image', image);
        }

        if (id){ // update
            try{
                const record = await pb.collection('recipes').update(id, formData);
                close()
            } catch (e) {
                console.log('could not update record: ' + id, e);
            }
        } else { // create
            
            // check for image
            if (!image){ 
                return;
            }
            try {
                const record = await pb.collection('recipes').create(formData);
                close();
                id = record.id;
            } catch (e) {
                console.log('could not create record', e);
            }
        }

    }

    async function deleteRecipe(){
        const confirmed = confirm('Are you sure you want to delete this recipe?');
        if (!id || !confirmed) return;

        try {            
            await pb.collection('recipes').delete(id);
            close();
        } catch (e) {
            console.log('could not delete record: ' + id, e);
        }
    }

    function handleDragStart(event, index) {
        draggedItemIndex = index;
        event.dataTransfer.setData('text/plain', '');
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDrop(event, index) {
        event.preventDefault();

        if (draggedItemIndex === null) return;

        const reorderedInstructions = [...instructions];
        reorderedInstructions.splice(index, 0, reorderedInstructions.splice(draggedItemIndex, 1)[0]);
        instructions = reorderedInstructions;

        draggedItemIndex = null;
    }

    function removeInstruction(index) {
        instructions.splice(index, 1);
        instructions = [...instructions];
    }

    function close() {
        dispatch('close');
    }

</script>



<div class="inline-flex">

    <div class="bg-[#F6F6F6] p-4 w-[100%] max-w-[500px] z-50 relative">
        <input type="hidden" bind:value={id}>
        <button class="absolute top-2 right-4" type="button" on:click={close}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="darkred" class="w-6 h-6">
                <circle cx="12" cy="12" r="10" stroke="darkred" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M7 7l10 10" />
            </svg> 
        </button>


        <div class="head flex flex-row items-center justify-between">
            <ImageHandler bind:image bind:imageChange bind:imageUrl/>

            <div class="flex flex-col items-end mt-6 space-y-1">
                <AutoTextArea bind:value={name} maxRows={2} maxCols={15} placeholder={'Name'} title={'name'} />

                <label for="" class="text-sm"> number of servings: 
                    <input type="number" inputmode="numeric" step="any" bind:value={no_servings} class="w-8 px-2 text-right text-sm">
                </label>
                <p class="text-sm"> calories per serving: <span class="text-purple-500 font-semibold">{Math.round(serving_calories)}</span></p>
            </div>
        </div>

        <div class="flex flex-col items-center py-2">
            <div class="inline-flex items-center space-x-4">
                <h1 class="py-2 font-semibold">Ingredients</h1>  
                <NewIngredient on:addIngredient={addIngredient}/>
            </div>

            {#each ingredients as ingredient (ingredient.food.id)}
                <IngredientEntry name={ingredient.name} food={ingredient.food} quantity={ingredient.quantity} measure={ingredient.measure} on:removeIngredient={removeIngredient} on:updateNumbers={updateNumbers}/>
            {/each}

        
        </div>

        <div class="flex flex-col items-center py-2">
            <div class="inline-flex items-center space-x-4">
                <h1 class="py-2 font-semibold">Instructions</h1>
                <NewStep on:click={() => {instructions = [...instructions, '']}}/>
            </div>

            <ul class="w-full space-y-1">
                {#each instructions as instruction, index }
                <li class="w-full inline-flex items-center" draggable="true" 
                    on:dragstart={(event) => handleDragStart(event, index)}
                    on:dragover={handleDragOver}
                    on:drop={(event) => handleDrop(event, index)}>
                    <label for="" class="text-sm"> {index + 1} </label>
                    <input type="text" bind:value={instructions[index]} class="text-sm w-full px-2 py-1 mx-2 rounded outline-none drop-shadow-sm focus:drop-shadow-lg"> 
                    
                    <button title="Close" on:click={() => {removeInstruction(index)}} class="addTypeIcon p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="darkred" class="bi bi-x" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </button>
                </li>
                {/each}
            </ul>

            
        </div>

        <div class="w-full mt-4 inline-flex justify-between">

            <button>
                <button on:click={deleteRecipe} class="px-4 py-2 border border-red-700 rounded-lg text-red-700 font-semibold">
                    Delete Recipe
                </button>
            </button>

            <button on:click={saveRecipe} class="px-6 py-2 border border-purple-500 rounded-lg  text-purple-500 font-semibold">
                Submit
            </button>
        </div>

    </div>

    <div class="relative">
        <div class="absolute">
            <NutritionPie labels={['protein', 'carbs', 'fat']} values={[serving_protein, serving_carbs, serving_fat]} cost={serving_cost} />
        </div>
    </div>

</div>