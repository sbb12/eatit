<script lang="ts">

    import { pb } from '../../pb/pocketbase';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let id: string;
    export let name: string;
    export let calories: number;

    function deleteEntry() {
        pb.collection('meal_entry').delete(id)
        dispatch('removeMeal', {id: id});
    }    

 // dispatch event to parent component?


</script>

<div class="meal-entry flex flex-row items-center p-2 bg-gray-200 my-1 w-full border-gray-400 border rounded-md">
    <img src="https://via.placeholder.com/50" alt='placeholder' />
    <div class="mx-4 w-[55%]">
        <p class=" font-semibold text-lg">{name}</p>  
    </div>
    <div class="w-[20%]">
        <p class="text-lg font-bold text-purple-500">{calories} <span class="text-md text-slate-600 font-normal">cal</span></p>
    </div>
    <button on:click={deleteEntry} class=""><svg width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="17.5" cy="17.5" r="13.125" stroke="darkred" stroke-width="2"/>
        <path d="M13.1251 21.8745L21.8751 13.1245" stroke="darkred" stroke-width="2"/>
        <path d="M21.875 21.875L13.125 13.125" stroke="darkred" stroke-width="2"/>
    </svg></button>

</div>

<style>
    .meal-entry img {
        width: 50px;
        height: 50px;
    }
</style>



    