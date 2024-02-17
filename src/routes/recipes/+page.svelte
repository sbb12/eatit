<script lang="ts">
	import { pb } from '$lib/pb/pocketbase';

	import RecipeEdit from '$lib/components/recipeEdit/RecipeEdit.svelte';
	import type { Record } from 'pocketbase';

	let editing: boolean = false;
	let editId: string = '';
	let searchInput: string = '';

	let recipes: Record[] = [];

	$: { searchInput, searchRecipes(); }

	async function searchRecipes() {
		if (searchInput.length < 1) {
			recipes = [];
			return;
		}
		try {
			const results = await pb.collection('recipes').getList(1, 15, {
				filter: 'name ~ "' + searchInput + '"',
				sort: 'created'
			});
			recipes = results.items;
		} catch (error) {
			console.log(error);
		}
	}

	function addNew() {
		editId = '';
		editing = true;
	}

	function editRecipe(recipeID: string) {
		editing = true;
		editId = recipeID;
	}

	function closeEdit() {
		editing = false;
		editId = '';
		searchRecipes();
	}
</script>

<main class="mx-auto max-w-[500px] px-2 flex flex-col my-4 relative">
	{#if editing}
		<RecipeEdit id={editId} on:close={closeEdit} />
	{:else}
		<input
			type="text"
			bind:value={searchInput}
			placeholder="Search by name or ingredient"
			class="w-full shadow appearance-none border py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline rounded outline-none drop-shadow-sm focus:drop-shadow-lg"
		/>

		<ul class="w-full">
			{#each recipes as recipe}
				<li class="inline-flex items-center w-full">
					<img
						src={`https://pb.sercan.co.uk/api/files/${recipe.collectionId}/${recipe.id}/${recipe.image}?thumb=50x50`}
						alt={recipe.name}
						width="45px"
						height="45px"
					/>

					<p class="w-full px-2">{recipe.name}</p>
					<p class="w-fit mx-2">{Math.round(recipe.serving_calories)}</p>
					<button type="button" class="mx-auto mx-4" on:click={() => editRecipe(recipe.id)}>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<g clip-path="url(#clip0_16_141)">
								<path
									d="M2.21301 14.06C1.92542 12.7017 1.92542 11.2983 2.21301 9.94001C3.32301 10.07 4.29301 9.70301 4.60901 8.93901C4.92601 8.17401 4.50101 7.22901 3.62301 6.53601C4.38005 5.37233 5.37233 4.38005 6.53601 3.62301C7.22801 4.50001 8.17401 4.92601 8.93901 4.60901C9.70401 4.29201 10.071 3.32301 9.94001 2.21301C11.2983 1.92542 12.7017 1.92542 14.06 2.21301C13.93 3.32301 14.297 4.29301 15.061 4.60901C15.826 4.92601 16.771 4.50101 17.464 3.62301C18.6277 4.38005 19.62 5.37233 20.377 6.53601C19.5 7.22801 19.074 8.17401 19.391 8.93901C19.708 9.70401 20.677 10.071 21.787 9.94001C22.0746 11.2983 22.0746 12.7017 21.787 14.06C20.677 13.93 19.707 14.297 19.391 15.061C19.074 15.826 19.499 16.771 20.377 17.464C19.62 18.6277 18.6277 19.62 17.464 20.377C16.772 19.5 15.826 19.074 15.061 19.391C14.296 19.708 13.929 20.677 14.06 21.787C12.7017 22.0746 11.2983 22.0746 9.94001 21.787C10.07 20.677 9.70301 19.707 8.93901 19.391C8.17401 19.074 7.22901 19.499 6.53601 20.377C5.37233 19.62 4.38005 18.6277 3.62301 17.464C4.50001 16.772 4.92601 15.826 4.60901 15.061C4.29201 14.296 3.32301 13.929 2.21301 14.06ZM4.00001 12.21C5.10001 12.515 6.00701 13.212 6.45701 14.296C6.90601 15.381 6.75701 16.516 6.19501 17.508C6.29101 17.61 6.39001 17.709 6.49201 17.805C7.48501 17.243 8.61901 17.095 9.70401 17.543C10.788 17.993 11.485 18.9 11.79 20C11.93 20.004 12.07 20.004 12.21 20C12.515 18.9 13.212 17.993 14.296 17.543C15.381 17.094 16.516 17.243 17.508 17.805C17.61 17.709 17.709 17.61 17.805 17.508C17.243 16.515 17.095 15.381 17.543 14.296C17.993 13.212 18.9 12.515 20 12.21C20.004 12.07 20.004 11.93 20 11.79C18.9 11.485 17.993 10.788 17.543 9.70401C17.094 8.61901 17.243 7.48401 17.805 6.49201C17.7086 6.3904 17.6096 6.29137 17.508 6.19501C16.515 6.75701 15.381 6.90501 14.296 6.45701C13.212 6.00701 12.515 5.10001 12.21 4.00001C12.07 3.9963 11.93 3.9963 11.79 4.00001C11.485 5.10001 10.788 6.00701 9.70401 6.45701C8.61901 6.90601 7.48401 6.75701 6.49201 6.19501C6.39001 6.29101 6.29101 6.39001 6.19501 6.49201C6.75701 7.48501 6.90501 8.61901 6.45701 9.70401C6.00701 10.788 5.10001 11.485 4.00001 11.79C3.99601 11.93 3.99601 12.07 4.00001 12.21ZM12 15C11.2044 15 10.4413 14.6839 9.87869 14.1213C9.31608 13.5587 9.00001 12.7957 9.00001 12C9.00001 11.2044 9.31608 10.4413 9.87869 9.87869C10.4413 9.31608 11.2044 9.00001 12 9.00001C12.7957 9.00001 13.5587 9.31608 14.1213 9.87869C14.6839 10.4413 15 11.2044 15 12C15 12.7957 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7957 15 12 15ZM12 13C12.2652 13 12.5196 12.8946 12.7071 12.7071C12.8946 12.5196 13 12.2652 13 12C13 11.7348 12.8946 11.4804 12.7071 11.2929C12.5196 11.1054 12.2652 11 12 11C11.7348 11 11.4804 11.1054 11.2929 11.2929C11.1054 11.4804 11 11.7348 11 12C11 12.2652 11.1054 12.5196 11.2929 12.7071C11.4804 12.8946 11.7348 13 12 13Z"
									fill="#09121F"
								/>
							</g>
							<defs>
								<clipPath id="clip0_16_141">
									<rect width="24" height="24" fill="white" />
								</clipPath>
							</defs>
						</svg>
					</button>
				</li>
			{/each}
		</ul>

		<button on:click={addNew} class="mx-auto my-4">
			<svg
				width="42"
				height="42"
				viewBox="0 0 42 42"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M5.25 13.25C5.25 9.47876 5.25 7.59315 6.42157 6.42157C7.59315 5.25 9.47876 5.25 13.25 5.25H28.75C32.5212 5.25 34.4069 5.25 35.5784 6.42157C36.75 7.59315 36.75 9.47876 36.75 13.25V28.75C36.75 32.5212 36.75 34.4069 35.5784 35.5784C34.4069 36.75 32.5212 36.75 28.75 36.75H13.25C9.47876 36.75 7.59315 36.75 6.42157 35.5784C5.25 34.4069 5.25 32.5212 5.25 28.75V13.25Z"
					stroke="rgb(168 85 247)"
					stroke-width="2"
				/>
				<path
					d="M21 14L21 28"
					stroke="rgb(168 85 247)"
					stroke-width="2"
					stroke-linecap="square"
					stroke-linejoin="round"
				/>
				<path
					d="M28 21L14 21"
					stroke="rgb(168 85 247)"
					stroke-width="2"
					stroke-linecap="square"
					stroke-linejoin="round"
				/>
			</svg>
		</button>
	{/if}
</main>
