<script lang="ts">
    import { pb } from "../../lib/pb/pocketbase";

    import RecipeEdit from "../../lib/components/recipeEdit/RecipeEdit.svelte";
	import type { Record } from "pocketbase";



    let editing: boolean = false;
    let editId: string = '';
    let searchInput: string = 'w';
    

    let recipes: Record[] = [];

    $: {searchInput, searchRecipes()}

    async function searchRecipes() {
        if (searchInput.length < 1) {
            recipes = [];
            return;
        }
        try {
            const results = await pb.collection('recipes').getList(1, 15, {
                filter: 'name ~ "' + searchInput + '"',
                sort: 'created'
            })
            recipes = results.items;
        } catch (error) {
            console.log(error)
        }
    }

    function editRecipe(recipeID){
        editing = true;
        editId = recipeID;
    }

</script>


<main class="mx-auto max-w-[500px] px-2 flex flex-col my-4 relative">

    {#if editing}
        <RecipeEdit id={editId}/>
    {:else}
        <input type="text" bind:value={searchInput} placeholder="Search by name or ingredient" class="w-full shadow appearance-none border py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline rounded outline-none drop-shadow-sm focus:drop-shadow-lg">

        <ul class="w-full">
            {#each recipes as recipe}
                <li class="inline-flex items-center w-full">
                    <img src="{`https://pb.surgo.dev/api/files/${recipe.collectionId}/${recipe.id}/${recipe.image}?thumb=50x50`}" alt="{recipe.name}" width="45px" height="45px">
                    
                    <p class="w-full px-2">{recipe.name}</p>
                    <p class="w-fit mx-2">{recipe.serving_calories}</p>
                    <button type="button" on:keypress class="mx-auto" on:click={()=> editRecipe(recipe.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </li>
            {/each}
        </ul>
    {/if}

</main>
