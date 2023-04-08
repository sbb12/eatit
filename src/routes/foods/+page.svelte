<script lang="ts">
    import { pb } from "../../lib/pb/pocketbase";
    import FoodEdit from "../../lib/components/FoodEdit.svelte";
	import { onMount } from "svelte";
    
    let searchInput: string = '';
    let foods: any[] = [];
    let editId: string|null = null;
    let editing: boolean = false;
    
    let imgURL = '';

    $: {searchInput, searchFoods()}

    async function searchFoods() {
        if (searchInput.length < 1) {
            foods = [];
            return;
        } 
        try {
            const results = await pb.collection('foods').getList(1, 15, {
                filter: 'name ~ "' + searchInput + '"',
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
    }

    function handleUpdate(event: Event){
        editing = false;
        editId = null;
    }

    function handleCreate(event: Event){
        editing = false;
        editId = null;
    }

    onMount(async ()=>{
        
    })

</script>


<main class="mx-auto max-w-[500px] flex flex-col my-4 relative">

    {#if editing}
            <FoodEdit id={editId} on:close={handleClose} on:update={handleUpdate} on:create={handleCreate}/>
    {:else}
        <input type="text" bind:value={searchInput} placeholder="Search by name" class="w-full shadow appearance-none border rounded py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
        
        <ul class="my-4 w-full">
            {#each foods as food}
            <li class="">
                <img src="{`https:/pb.surgo.dev/api/files/foods/${food.id}/${food.image}`}" alt="{food.name}">
                <p>
                    {food.name}
                </p>
                <div class="buttons">
                    <button type="button">❌</button>
                    <button type="button" on:click={()=>{editing=true, editId=food.id}}>🔧</button>
                </div>

            </li>
            {/each}
        </ul>

        <div class="mx-auto" on:click={ () => {editing = true, editId = null}} on:keypress={()=>{editing = true, editId = null}}>
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.25 13.25C5.25 9.47876 5.25 7.59315 6.42157 6.42157C7.59315 5.25 9.47876 5.25 13.25 5.25H28.75C32.5212 5.25 34.4069 5.25 35.5784 6.42157C36.75 7.59315 36.75 9.47876 36.75 13.25V28.75C36.75 32.5212 36.75 34.4069 35.5784 35.5784C34.4069 36.75 32.5212 36.75 28.75 36.75H13.25C9.47876 36.75 7.59315 36.75 6.42157 35.5784C5.25 34.4069 5.25 32.5212 5.25 28.75V13.25Z" stroke="rgb(168 85 247)" stroke-width="2"/>
                <path d="M21 14L21 28" stroke="rgb(168 85 247)" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"/>
                <path d="M28 21L14 21" stroke="rgb(168 85 247)" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"/>
            </svg>
        </div>
    {/if}

    
</main>


<style lang="scss">
    main {
        ul {
            li {
                display: flex;
                flex-direction: row;
                align-items: center;
                padding: 4px 0;

                img {
                    height: 50px;
                    width: 50px;
                }
                p {
                    width: 180px;
                    padding: 0 8px;
                }
                span {
                    width: 80px;
                    padding: 0 8px;
                }
                .buttons{
                    width: 140px;
                    display: flex;
                    flex-direction: row-reverse;

                    button {
                        padding: 4px;
                        margin: 0 4px;
                    }
                }
                
            }
        }
    }
</style>