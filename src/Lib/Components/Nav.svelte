<script lang="ts">
    import { onMount } from "svelte";
    import { pb } from "../pb/pocketbase";
    import AnimatedBurger from "./AnimatedBurger.svelte";


    export let open = false;
    $: innerWidth = 0;

    function onClick(){
        open = !open;
        console.log('burger clicked', open)
    }

    function logout() {
        pb.authStore.clear();
    }

</script>

<svelte:window bind:innerWidth/>

<nav class="flex w-full justify-between bg-slate-200">
    <div class="text-2xl font-bold p-4">
        EatIt
    </div>
    {#if innerWidth >= 768}
    <div class="flex items-center p-4">
        <div class="flex items-center">
            <a href="/" class="ml-4">Track</a>
            <!-- <a href="/meals">Meals</a> -->
            <a href="/foods" class="ml-4">Foods</a>
            <a href="/history" class="ml-4">History</a>
            <a href="/recipes" class="ml-4">Recipes</a>
        </div>
    </div>
    <div class="flex items-center p-4">
        <a href="/" on:click={logout}>Logout</a>
    </div>
    
    {:else}
        <AnimatedBurger {open} on:click={onClick}/>

    {/if}




</nav>


<style> 


</style>