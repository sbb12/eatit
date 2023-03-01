<script lang="ts">
	import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';

    import { pb } from '../pb/pocketbase';

    export let id: string|null = null;
    let name: string;
    let barcode: string;
    let image: string = 'https://via.placeholder.com/150';
    let options: any = [];

    let editingPicture: boolean = false;
    

    const dispatch = createEventDispatcher();

    function closed () {
        dispatch('message', {action: 'closed'});
    }

    function removeOption(measure: string){
        options = options.filter((option: any) => option.measure !== measure);
    }

    async function getFood() {
        if (id){
            try {
                const record = await pb.collection('foods_basic').getOne(id);
                name = record.name;
                barcode = record.barcode;
                image = record.image;
                options = (record.options) ? JSON.parse(record.options) : [];
            } catch (e) {
                console.log('could not get record: ' + id, e)
            }
        }
    }

    async function handleSubmit() {
        const data = {
            name: name,
            barcode: barcode,
            image: image,
            options: (options.length > 0) ? JSON.stringify(options) : null
        }

        if (id){
            try{
                const record = await pb.collection('foods_basic').update(id, data);
                dispatch('message', {action: 'updated'});
            } catch (e) {
                console.log('could not update record: ' + id, e);
            }
        } else {
            try {
                const record = await pb.collection('foods_basic').create(data);
                id = record.id;
                console.log('created record: ' + id)
                dispatch('message', {action: 'added'});
            } catch (e) {
                console.log('could not create record', e);
            }

        }
    }

    function calcInput(inputString: string) {
        if (inputString.match(/^=.+;/)){
            return eval(inputString.replace(/^=/, '').replace(/;$/, ''));
        } else {
            return inputString;
        }
    }

    onMount(async () => {
        if (id) {
            getFood();
        }
    })

</script>



<form class="bg-[#F6F6F6] p-4 w-[550px] z-50 relative" >
    <input type="hidden" bind:value={id}>
    <button class="absolute top-2 right-4" type="button" on:click|preventDefault={closed}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="darkred" class="w-6 h-6">
            <circle cx="12" cy="12" r="10" stroke="darkred" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M7 7l10 10" />
        </svg> 
    </button>

    <div class="head flex flex-row items-center justify-between">
        {#if editingPicture}
        <div class="z-20 h-[120px] relative">
            <input type="text" bind:value={image} class="absolute w-[420px] top-5 border p-2">
            <button type="button" on:click = {() => {editingPicture = false}} class="absolute top-16 px-4 py-2 border border-green-500 text-green-500 rounded">save</button>
        </div>
        {:else}
            <img src="{image}" alt="placeholder" class="w-[120px] h-[120px]" on:click = {() =>  {editingPicture = true}} on:keydown = {() =>  {editingPicture = true}}>
        {/if}

        <div class="flex flex-col">
            <input type="text" placeholder="Name" bind:value={name} class="h-10 px-2 py-1">
            <input type="text" placeholder="Barcode" bind:value={barcode} class="h-10 px-2 py-1 text-right bg-transparent">
        </div>
    </div>

    <div class="flex flex-col">
        {#each options as option} 
        <div class="grid grid-cols-6 my-4 gap-4 text-center ">
            <input type="text" placeholder="Measure" bind:value={option.measure} class="h-10 px-2 py-1">
            <input type="text" placeholder="Calories" bind:value={option.cal} on:change={() => {option.cal = calcInput(option.cal)}} class="h-10 px-2 py-1">
            <input type="text" placeholder="Cost" bind:value={option.cost}  on:change={() => {option.cost = calcInput(option.cost)}} class="h-10 px-2 py-1">
            <input type="text" placeholder="Proteins" bind:value={option.protein} on:change={() => {option.protein = calcInput(option.protein)}}  class="h-10 px-2 py-1">
            <input type="text" placeholder="Fats" bind:value={option.fat}  on:change={() => {option.fat = calcInput(option.fat)}} class="h-10 px-2 py-1">
            <input type="text" placeholder="Carbs" bind:value={option.carb}  on:change={() => {option.carb = calcInput(option.carb)}} class="h-10 px-2 py-1">
            <input type="text" placeholder="Description" bind:value={option.desc} class="h-10 px-2 py-1 col-span-5">
            <button class="" type="button" on:click = {() => {removeOption(option.measure)}}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="darkred" class="w-6 h-6">
                    <circle cx="12" cy="12" r="10" stroke="darkred" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M7 7l10 10" />
                </svg> 
            </button>

        </div>
        {/each}

        <button on:click|preventDefault = {() => options = [...options, {}]} class="col-span-2 my-4 px-6 py-2 border border-purple-500 rounded-lg text-purple-500 font-semibold">New measure</button>
        
    </div>


    <div class="w-full inline-flex flex-row-reverse">
        <button on:click|preventDefault = {handleSubmit} class="px-6 py-2 border border-purple-500 rounded-lg text-purple-500 font-semibold">Submit</button>
    </div>
</form>



<style lang="scss">

</style>