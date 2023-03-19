<script>
    import { pb } from "../pb/pocketbase";

    function logout() {
        pb.authStore.clear();
    }

</script>

<nav class="flex w-full justify-between bg-slate-200">
    <div class=" text-2xl font-bold p-4">
        Logo
    </div>
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
    <div class="text-2xl font-bold ml-4 hidden"> = </div>
</nav>


<style>    
</style>