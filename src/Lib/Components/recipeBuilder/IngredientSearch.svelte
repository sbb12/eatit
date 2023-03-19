<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import FoodOption from "./FoodOption.svelte";
    const dispatch = createEventDispatcher();


    let foods: any[] = [];

</script>

<form>
    quick add some stuff
</form>

<form class="flex flex-row">
    <h2>Search from DataBase</h2>
    <input type="text" placeholder="search by name" class="p-2 rounded outline-none drop-shadow-sm focus:drop-shadow-lg">
</form>

<div>
    {#if foods.length}
        {#each foods as food}
            <!-- <FoodOption {food} on:addFood={addFood}/> -->
        {/each}
    {/if}
</div>