<script lang="ts">
    
    export let food: any = {};
    let quantity = 1;
    let options = JSON.parse(food.options);
    let measure = options[0].measure;

</script>


<div>
    <img src="{food.image}" alt='placeholder' class="col-span-1 p-1 w-[50px] h-[50px]"/>
    <p>{food.name}</p>
    <input type="number" placeholder="qty" bind:value={quantity} class="px-1 mr-2 focus:outline-none h-6 rounded-sm drop-shadow">
    <select class="col-span-1 focus:outline-none h-6 mr-[-20px] rounded-sm drop-shadow" bind:value={measure}>
        {#each options as option (option)}
                <option value="{option.measure}" title="{option.desc ? option.desc : ''}" >
                    {option.measure}
                </option>
        {/each}
    </select>

</div>