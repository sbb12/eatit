<script lang="ts">

    export let id: string = "";
    let name = "";
    let image = "";
    let desc = "";
    let servings = 1;
    
    let ingredients = [];
    let directions = [];
    let tags = [];
    
    
    let calories = 0;
    let fat = 0;
    let carbs = 0;
    let protein = 0;
    let cost = 0;
    

</script>


<div class="trackbox bg-gray-100 m-2 py-8 px-6  w-[550px]">

    <div>
        <img src={image} alt={name} class="" />
        <input type="text" bind:value={name} placeholder="Recipe Name" class="" />
    </div>

    <search>
        
    </search>


    
</div>
