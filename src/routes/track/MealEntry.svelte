<script lang="ts">
	import Option from '$lib/components/foodEdit/Option.svelte';
	import type { Meal } from '$lib/types';

	import { pb } from '../../lib/pb/pocketbase';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let meal: Meal;

	let id: string = meal.id;
	let food = meal.food;
	let quantity: number = meal.quantity;
	let measure: string = meal.measure;
	let calories: number = meal.calories;
	let options = food?.options;

	console.log(meal);

	function removeMeal() {
		pb.collection('meal_entry').delete(id);
		dispatch('removeMeal', id);
	}

	async function updateMeal() {
		const option = options.find((option) => option.measure === measure);

		if (!option) {
			console.log('no option found');
			return;
		}

		calories = quantity * option.calories;
		calories = Math.round(calories);
		const data = {
			// food: food,
			quantity: quantity,
			measure: measure,
			calories: calories
		};
		pb.collection('meal_entry').update(id, data);

		dispatch('updateMeal', { id, quantity, measure, food });
	}
</script>

{#if food}
	<div class="meal-entry grid grid-cols-8 w-full rounded-sm items-center">
		<img
			src={`https://pb.sercan.co.uk/api/files/${food.collectionId}/${food.id}/${food.image}?thumb=50x50`}
			alt="placeholder"
			title={food.brands}
			class="col-span-1 p-1 w-[50px] h-[50px]"
		/>
		<p class="font-semibold text-sm col-span-3 p-1 " title={food.brands}>
			{food.name != 'quick_calories' ? food.name : meal.name}
		</p>
		<input
			type="number"
			class="col-span-1 w-[40px] bg-gray-100 focus:outline-none"
			bind:value={quantity}
			on:input={updateMeal}
		/>

		<select class="col-span-1 m-[-1rem] bg-gray-100" bind:value={measure} on:change={updateMeal}>
			{#each options as option}
				<option value={option.measure} title={option.desc ? option.desc : ''}
					>{option.measure}</option
				>
			{/each}
		</select>

		<p class="col-span-1 ml-auto text-lg font-semibold text-purple-500">
			{calories} <span class="text-md text-slate-600 font-normal" />
		</p>

		<button on:click|preventDefault={removeMeal} class="col-span-1 mx-auto">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="28"
				height="28"
				fill="darkred"
				class="bi bi-x"
				viewBox="0 0 16 16"
			>
				<path
					d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
				/>
			</svg>
		</button>
	</div>
{/if}
