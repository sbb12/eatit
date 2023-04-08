<script lang="ts">
    import { onMount } from "svelte";
    import { pb, currentUser } from "../pb/pocketbase";
    import AnimatedBurger from "./AnimatedBurger.svelte";

    let mobileMenuEl: HTMLElement;
    export let open = false;
    $: innerWidth = 0;

    function onClick(){        
        open = !open;
        !open ? mobileMenuEl.classList.add('closed') : mobileMenuEl.classList.remove('closed');
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
    {#if $currentUser}
        {#if innerWidth >= 768}
            <div class="flex items-center p-4">
                <div class="flex items-center">
                    <a href="/track" class="ml-4">Track</a>
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
            <div class="z-50">
                <AnimatedBurger {open} on:click={onClick}/>
            </div>
            {#if open}
                <overlay class="fixed top-0 left-0 w-full h-full z-30 backdrop-blur-lg bg-black opacity-50"></overlay>
            {/if}
            <ul bind:this={mobileMenuEl} class="fixed top-0 right-0 z-40 flex flex-col items-center bg-slate-300 closed">
                <li class="py-5 px-20"><a href="/track" on:click={onClick}>Track</a></li>
                <!-- <li><a href="/meals" on:click={onClick}>Meals</a></li> -->
                <li class="py-5 px-20"><a href="/foods"  on:click={onClick}>Foods</a></li>
                <li class="py-5 px-20"><a href="/history" on:click={onClick}>History</a></li>
                <li class="py-5 px-20"><a href="/recipes"  on:click={onClick}>Recipes</a></li>
                <li class="py-5 px-20"><a href="/" on:click={logout} on:click={onClick}>Logout</a></li>
            </ul>
            
        {/if}
    {/if}
</nav>


<style> 
    ul {
        transform: translateX(0%);
        transition: all 0.25s ease-in-out;
    }
    ul.closed {
        transform: translateX(100%);
    }
</style>