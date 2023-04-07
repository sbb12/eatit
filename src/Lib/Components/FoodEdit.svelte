<script lang="ts">
	import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';

    import { pb } from '../pb/pocketbase';

    export let id: string|null = null;
    export let apiData: any = null;
    export let foodType: string = 'basic';

    let name: string;
    let barcode: string;
    let image: string = '/imgs/placeholder.webp';
    let options: any = [];
    

    let editingPicture: boolean = false;
    

    const dispatch = createEventDispatcher();

    function closed () {
        dispatch('close');
    }

    function removeOption(measure: string){
        options = options.filter((option: any) => option.measure !== measure);
    }

    async function getFood() {
        if (id){
            try {
                let record;
                switch (foodType) {
                    case 'basic':
                        record = await pb.collection('foods_basic').getOne(id);
                        break;
                    case 'branded':
                        record = await pb.collection('foods_branded').getOne(id);
                        break;
                    default:
                        console.log ('food record not found ' + id)
                        return;
                }
                
                name = record?.name;
                barcode = record?.barcode;
                image = record?.image;
                options = (record?.options) ? JSON.parse(record.options) : [];

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
                let record;
                switch(foodType) {
                    case 'basic':
                        record = await pb.collection('foods_basic').update(id, data);
                        break;
                    case 'branded':
                        record = await pb.collection('foods_branded').update(id, data);
                        break;
                    default:
                        return;
                }
                dispatch('update');
            } catch (e) {
                console.log('could not update record: ' + id, e);
            }
        } else {
            try {
                let record;
                switch(foodType) {
                    case 'basic':
                        record = await pb.collection('foods_basic').create(data);
                        break;
                    case 'branded':
                        record = await pb.collection('foods_branded').create(data);
                        break;
                    default:
                        return;
                }
                id = record.id;
                console.log('created record: ' + id)
                dispatch('create');
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
        if (apiData) {
            name = apiData.name;
            barcode = apiData.barcode;
            image = apiData.image;
            console.log(JSON.parse(apiData.options))
            JSON.parse(apiData.options).forEach((option: any) => {
                options = [...options, {
                    measure: option.measure,
                    calories: option.calories,
                    protein: option.protein,
                    carbs: option.carbs,
                    fat: option.fat,
                    desc: option.desc,
                    cost: 0
                }]
            })
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
                <input type="text" placeholder="Calories" bind:value={option.calories} on:change={() => {option.calories = calcInput(option.calories)}} class="h-10 px-2 py-1">
                <input type="text" placeholder="Cost" bind:value={option.cost}  on:change={() => {option.cost = calcInput(option.cost)}} class="h-10 px-2 py-1">
                <input type="text" placeholder="Proteins" bind:value={option.protein} on:change={() => {option.protein = calcInput(option.protein)}}  class="h-10 px-2 py-1">
                <input type="text" placeholder="Fats" bind:value={option.fat}  on:change={() => {option.fat = calcInput(option.fat)}} class="h-10 px-2 py-1">
                <input type="text" placeholder="Carbs" bind:value={option.carbs}  on:change={() => {option.carbs = calcInput(option.carbs)}} class="h-10 px-2 py-1">
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