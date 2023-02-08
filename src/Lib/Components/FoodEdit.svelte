<script lang="ts">
	import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';

    import { pb } from '../pb/pocketbase';

    export let id: string|null = null;
    let name: string;
    let calories: number;
    let carbs: number;
    let protein: number;
    let fats: number;
    let cost: number;
    let servingDesc: string;

    const dispatch = createEventDispatcher();

    function closed () {
        dispatch('message', {action: 'closed'});
    }

    async function getFood() {
        try{
            const record = await pb.collection('foods').getOne(id, {});

            name = record.name;
            calories = record.cal;
            carbs = record.carbs;
            protein = record.protein;
            fats = record.fats;
            cost = record.cost;
            servingDesc = record.description;

            console.log('food found: ' + id)

        } catch (e) {
            if (e.status === 404) {
                console.log('could not find food with id: ' + id)
                id = null;
            }
        }
    }

    async function handleSubmit() {
        const data = {
            "name": name,
            "description": servingDesc,
            "cal": calories,
            "carbs": carbs,
            "fats": fats,
            "protein": protein,
            "cost": cost,
            "img": "https://via.placeholder.com/150",
        }

        if (id){
            try{
                const record = await pb.collection('foods').update(id, data);
                console.log('updated record: ' + id)
                dispatch('message', {action: 'updated'});
            } catch (e) {
                console.log('could not update record: ' + id, e);
            }
        } else {
            try {
                const record = await pb.collection('foods').create(data);
                id = record.id;
                console.log('created record: ' + id)
                dispatch('message', {action: 'added'});
            } catch (e) {
                console.log('could not create record', e);
            }

        }
    }

    onMount(async () => {
        if (id) {
            getFood();
        }
    })

</script>



<form class="bg-[#F6F6F6] p-4 w-[450px] z-50 relative" >
    <input type="hidden" bind:value={id}>
    <button class="absolute top-2 right-4" type="button" on:click|preventDefault={closed}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="darkred" class="w-6 h-6">
            <circle cx="12" cy="12" r="10" stroke="darkred" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M7 7l10 10" />
        </svg>
    </button>

    <div class="head flex flex-row items-center justify-between">
        <img src="https://via.placeholder.com/150" alt="placeholder" class="w-[120px] h-[120px]">
        <input type="text" placeholder="Name" bind:value={name} class="h-10 px-2 py-1 ml-16">
    </div>

    <div class="mid grid grid-cols-2 my-8 gap-4 text-center">
        <label for="cals">Calories</label>
        <input type="number" id="cals" bind:value={calories} class="px-2">

        <label for="carbs">Carbs</label>
        <input type="number" id="carbs" bind:value={carbs} class="px-2">

        <label for="protein">Protein</label>
        <input type="number" id="protein" bind:value={protein} class="px-2">

        <label for="fats">Fats</label>
        <input type="number" id="fat" bind:value={fats} class="px-2">

        <label for="cost">Cost</label>
        <input type="number" id="cost" bind:value={cost} class="px-2">

        <label for="serving">Serving</label>
        <input type="text" id="serving" bind:value={servingDesc} class="px-2">

    </div>
    <div class="w-full inline-flex flex-row-reverse">
        <button on:click|preventDefault = {handleSubmit} class="px-6 py-2 border border-purple-500 rounded-lg text-purple-500 font-semibold">Add</button>
    </div>
</form>



<style lang="scss">

</style>