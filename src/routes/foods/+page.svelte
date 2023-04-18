<script lang="ts">
	import { onMount } from "svelte";
    import { pb } from "../../lib/pb/pocketbase";
    import FoodEdit from "../../lib/components/foodEdit/FoodEdit.svelte";
    import BarcodeHandler from "../../lib/components/scanner/BarcodeHandler.svelte";
    
    let searchInput: string = '';
    let foods: any[] = [];
    let editId: string|null = null;
    let editing: boolean = false;
    let scannedEdit: boolean = false;    

    $: {searchInput, searchFoods()}

    async function searchFoods() {
        if (searchInput.length < 1) {
            foods = [];
            return;
        } 
        try {
            const results = await pb.collection('foods').getList(1, 15, {
                filter: 'name ~ "' + searchInput + '" || brands ~ "' + searchInput + '"',
                sort: 'created'
            })
            foods = results.items;
        } catch (error) {
            console.log(error)
        }
    }

    function handleClose(event: Event){
        editing = false;
        editId = null;
        searchFoods()
    }

    function handleUpdate(event: Event){
        editing = false;
        editId = null;
        searchFoods()
    }

    function handleCreate(event: Event){
        editing = false;
        editId = null;
        searchFoods()
    }

    function handleEdit(event: Event){
        editId =  event.detail.food_id
        editing = true;
    }

    function promptDelete(food: any): void {
        if (!food.id) return;
        const confirmed = confirm(`Delete ${food.name}?`)
        if (confirmed) {
            deleteFood(food.id)
        }
    }

    function handleScanPress(){
        scannedEdit = true;
    }

    async function deleteFood(id:string): Promise<void> {
        try {
            await pb.collection('foods').delete(id)
            searchFoods()
        } catch(err){
            console.log(err)
        }
    }

    onMount(async ()=>{
        
    })

</script>

<main class="mx-auto max-w-[500px] px-2 flex flex-col my-4 relative">

    {#if editing}
            <FoodEdit id={editId} on:close={handleClose} on:update={handleUpdate} on:create={handleCreate}/>
    {:else if scannedEdit}
            <BarcodeHandler on:foundFood={handleEdit} startDefault={true}/>
    {:else}
        <input type="text" bind:value={searchInput} placeholder="Search by name" class="w-full shadow appearance-none border py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline rounded outline-none drop-shadow-sm focus:drop-shadow-lg">
        
        <ul class="my-4 w-full ">
            {#each foods as food}
            <li class=" inline-flex w-full items-center">
                <img src="{`https://pb.surgo.dev/api/files/foods/${food.id}/${food.image}`}" alt="{food.name}" class="h-[50px] w-[50px]">
                <p class="text-left w-full px-2">
                    {food.name}
                </p>
                <div class="buttons ml-auto inline-flex space-x-2">
                    <button type="button" on:click={()=>{editing=true, editId=food.id}}>🔧</button>
                    <button type="button" on:click={()=>{promptDelete(food)}}>❌</button>
                </div>

            </li>
            {/each}
        </ul>

        <div class="flex flex-row justify-evenly">
            <div class="" on:click={ () => {editing = true, editId = null}} on:keypress={()=>{editing = true, editId = null}}>
                <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.25 13.25C5.25 9.47876 5.25 7.59315 6.42157 6.42157C7.59315 5.25 9.47876 5.25 13.25 5.25H28.75C32.5212 5.25 34.4069 5.25 35.5784 6.42157C36.75 7.59315 36.75 9.47876 36.75 13.25V28.75C36.75 32.5212 36.75 34.4069 35.5784 35.5784C34.4069 36.75 32.5212 36.75 28.75 36.75H13.25C9.47876 36.75 7.59315 36.75 6.42157 35.5784C5.25 34.4069 5.25 32.5212 5.25 28.75V13.25Z" stroke="rgb(168 85 247)" stroke-width="2"/>
                    <path d="M21 14L21 28" stroke="rgb(168 85 247)" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"/>
                    <path d="M28 21L14 21" stroke="rgb(168 85 247)" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"/>
                </svg>
            </div>
            <div class="py-1" on:click={handleScanPress} on:keypress={handleScanPress}>
                <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" fill="rgb(168 85 247)" class="bi bi-upc-scan" viewBox="0 0 16 16">
                    <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1h-3zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5zM.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5zM3 4.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-7zm3 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7z"/>
                </svg>
            </div>
        </div>
    {/if}

    
</main>

