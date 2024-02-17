<script lang='ts'>
    import { onMount } from 'svelte';
    // import { Datepicker } from 'svelte-calendar';
	import { currentUser, pb } from '$lib/pb/pocketbase';
    // import { dateStr } from '$lib/utils';
    import { createDayTrack, getDayTrack } from '$lib/pb/dayTrack';
    import { getMealEntriesID } from '$lib/pb/mealEntry';
    import type { User, Meal, Food } from '$lib/types';
    import MealEntry from './MealEntry.svelte';
    import NewMeal from '$lib/components/NewMeal.svelte';
    import Weight from './Weight.svelte';
    // import NutritionPie from '$lib/components/tracker/NutritionPie.svelte';

    let dayID = '';
    let loadingDay: boolean = false;
    let calGoal: number = $currentUser?.calorie_goal ?? 0;
    let calConsumed: number = 0;
    
    let date: Date = new Date();; 
    let selected = date;
    let previousSelected: null = null;
    
    let meals: Meal[] = [];
    // let protein: number = 0;
    // let carbs: number = 0;
    // let fat: number = 0;
    // let cost: number = 0;
    
    $: calRemain = (calGoal - calConsumed)
    $: selected && (selected != previousSelected) && loadDay(selected);
    $: mealCalc(meals)

    onMount( async () => {

    })
    
    function mealCalc(meals: any){

        // protein = 0;
        // carbs = 0;
        // fat = 0;
        calConsumed = 0;
        // cost = 0;

        meals.forEach((meal: any) => {
            // protein += meal.protein;
            // carbs += meal.carbs;
            // fat += meal.fat;
            calConsumed += meal.calories;
            // cost += meal.cost
        })
    }      

    function addMeal(event: any): void{
        const meal = {
            id: event.detail.entry.id,
            name: event.detail.entry.name,
            measure: event.detail.entry.measure,
            quantity: event.detail.entry.quantity,
            calories: event.detail.entry.calories,
            protein: event.detail.entry.protein,
            carbs: event.detail.entry.carbs,
            fat: event.detail.entry.fat,
            cost: event.detail.entry.cost,
            food: event.detail.food,
        }
        meals = [...meals, meal];
    }

    function removeMeal(event: any): void{
        meals = meals.filter((m) => m.id !== event.detail);
    }

    function updateMeal(event: any): void{
        meals = meals.map((m) => {
            if (m.id === event.detail.id) {

                const food = event.detail.food as Food;
                const measure = event.detail.measure;
                const quantity = event.detail.quantity;
                const option = food.options.find((option) => option.measure === measure);
                
                let calories = quantity * option!.calories ;
                calories = Math.round(calories);

                return {
                    ...m,
                    quantity:quantity,
                    measure: measure,
                    calories:calories,
                } ;
            } else {
                return m;
            }
        })
    }

    async function loadDay(selectedDate: Date){
        if (! $currentUser || !selectedDate) return;
        // day entry for this date
        const dayEntry = await getDayTrack($currentUser as User, selectedDate);
        
        // if it doesn't exist, create a new one 
        if (dayEntry.code && dayEntry.code === 404) {
            const newDayEntry = await createDayTrack($currentUser as User, selectedDate);
            dayID = newDayEntry.id;
        } else {
            dayID = dayEntry.id;
        }

        meals = await getMealEntriesID(dayID);
    }   

</script>

<div class="flex flex-col lg:flex-row w-full max-w-[900px] mx-auto">
    <div class="relative trackbox bg-gray-100 py-8 px-6 w-full max-w-[500px] mx-auto">
        <div class="headers flex flex-row justify-between ">
            <div class="flex flex-col">
                <div class="inline-flex h-10">
                    <p class="w-[100px] text-right pr-4 text-[#619B8A] text-[40px] leading-none">{loadingDay ? '...' : calRemain}</p>
                    <p class="text-slate-600 text-[20px] leading-[2.7]" >Remaining</p>
                </div>
                <div class="inline-flex">
                    <p class="w-[100px] text-right pr-4 text-[#619B8A]">{calConsumed}</p>
                    <p class="text-slate-400">Consumed</p>
                </div> 
                <div class="inline-flex">
                    <p class="w-[100px] text-right pr-4 text-[#A1C181]">{calGoal}</p>
                    <p class=" text-slate-400">Goal</p>
                </div> 
            </div>
            <div class="">
                <div class="inline-flex ml-12 transition-none">                    
                   
                    
                </div>
                {#if dayID}
                    <Weight id={dayID}/>
                {/if}
            </div>
        </div>
        <div class="my-10">
            {#each meals as meal (meal.id)}
                <MealEntry meal={meal} on:updateMeal={updateMeal} on:removeMeal={removeMeal} on:addMeal/>
            {/each}
        </div>
            <NewMeal on:addMeal={addMeal} {dayID}/>
    </div>

</div>