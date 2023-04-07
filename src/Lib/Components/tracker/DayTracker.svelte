<script lang='ts'>
	import { currentUser, pb } from '../../pb/pocketbase';
    import { onMount } from 'svelte';
    import MealEntry from './MealEntry.svelte';
    import NewMeal from './NewMeal.svelte';
    import Weight from './Weight.svelte';
    import NutritionPie from './NutritionPie.svelte';

    let weight: number|null = null;
    let calGoal: number;
    let calConsumed: number = 0;
    $: calLeft = calGoal - calConsumed;


    let protein: number = 0;
    let carbs: number = 0;
    let fat: number = 0;
    let cost: number = 0;


    export let date: Date;  
    if (!date) {
        date = new Date();
    }
    const dateString: string = date.toISOString().split('T')[0];

    let entry: any;
    let meals: any[] = [];

    $: {meals, mealCalc()}
    
    function mealCalc(){
        protein = 0;
        carbs = 0;
        fat = 0;
        calConsumed = 0;
        cost = 0;

        meals.forEach((meal) => {
            protein += meal.protein;
            carbs += meal.carbs;
            fat += meal.fat;
            calConsumed += meal.calories;
            cost += parseFloat(meal.cost);
        })

        cost = cost.toFixed(2);
        calLeft = calGoal - calConsumed;
    }

    onMount( async () => {
        // fetch user data to get calorie goal
        const record = await pb.collection('users').getOne(`${$currentUser?.id}`, {});
        calGoal = record.cal_goal;

        // get day entry
        const day_resp = await pb.collection('day_track').getList(1, 50, {
            filter: `user.id = "${$currentUser?.id}" && date ~ "${dateString}%"`,
        })
        
        // if no entry, create one
        if (day_resp.items.length === 0) {
            const newEntry = await pb.collection('day_track').create({
                user: $currentUser?.id,
                date: date.toISOString(),
                goal: calGoal,
                weight: null,
            })
            entry = newEntry;
        } else {
            entry = day_resp.items[0];
        }
        // set weight
        weight = entry.weight;


        // get meals for this day
        let meals_resp = await pb.collection('meal_entry').getList(1, 50, {
            filter: 'day.id = "' + entry.id + '"',
            expand: 'food_id',
            sort: 'created'
        })
        meals = meals_resp.items.map((m) => {
            return {
                id: m.id,
                name: m.name,
                measure: m.measure,
                quantity: m.quantity,
                calories: m.calories,
                protein: m.protein,
                carbs: m.carbs,
                fat: m.fat,
                cost: m.cost,
                food: m.expand.food_id,
            }
        });

    })

    function removeMeal(event: any){
        meals = meals.filter((m) => m.id !== event.detail.id);
    }

    function addMeal(event: any){
        console.log('addmeal', event.detail)

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

    function updateMeal(event: any){
        meals = meals.map((m) => {
            if (m.id === event.detail.id) {
                return {
                    ...m,
                    quantity: event.detail.quantity,
                    measure: event.detail.measure,
                    calories: event.detail.calories,
                }
            } else {
                return m;
            }
        })
    }

    function dateStr(){
        const d = date.getDate();
        if (d > 3 && d < 21) return d +'th';
        switch (d % 10) {
            case 1:  return d +"st";
            case 2:  return d +"nd";
            case 3:  return d +"rd";
            default: return d +"th";
        }
    }

</script>


<div class="trackbox bg-gray-100 m-2 py-8 px-6  w-[550px] max-w-full">
    
    <div class="headers flex flex-row justify-between ">
        <div class="flex flex-col">
            <div class="inline-flex h-10">
                <p class="w-[100px] text-right pr-4 text-[#619B8A] text-[40px] leading-none">{calLeft}</p>
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
            <div class="inline-flex ml-12">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="rgb(168 85 247)" class="w-8 h-8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                </svg>
                <div class="pl-2">
                    <p>{dateStr()}</p>
                </div>
            </div>

            <Weight id={entry?.id} weight={entry?.weight}/>
        </div>
    </div>

    <div class="my-10">
        {#each meals as meal}
            <MealEntry meal={meal} on:removeMeal={removeMeal} on:updateMeal={updateMeal}/>
        {/each}
    </div>
    
    <NewMeal dayID = {entry?.id} on:addMeal={addMeal}/>
</div>

<NutritionPie labels={['protein', 'carbs', 'fat']} values={[protein, carbs, fat]} {cost} />






  