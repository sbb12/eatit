<script>
    import { pb } from "../pb/pocketbase";

    function logout() {
        pb.authStore.clear();
    }

</script>

<nav class="flex w-full justify-between bg-slate-200">
    <div class="logo p-4">
        Logo
    </div>
    <div class="middle p-4">
        <div class="items">
            <a href="/">Track</a>
            <!-- <a href="/meals">Meals</a> -->
            <a href="/foods">Foods</a>
            <a href="/history">History</a>
        </div>
    </div>
    <div class="right p-4">
        <a href="/" on:click={logout}>Logout</a>
    </div>
    <div class="burger hidden"> = </div>
</nav>


<style>
    .logo {
        font-size: 1.5rem;
        font-weight: 700;
    }
    .middle {
        display: flex;
        align-items: center;
    }
    .right {
        display: flex;
        align-items: center;
    }
    .items {
        display: flex;
        align-items: center;
    }
    .items a {
        margin-left: 1rem;
    }
    .burger {
        font-size: 1.5rem;
        font-weight: 700;
        margin-left: 1rem;
    }
</style>