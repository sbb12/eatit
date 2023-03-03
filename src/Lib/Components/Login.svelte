<script lang="ts">
	import { pb } from "../pb/pocketbase";

    let email = '';
    let password = '';

    let errors: string[] = [];

    async function login(){
        errors = [];
        try {
            await pb.collection('users').authWithPassword(email, password);
        } catch (error) {
            handleError(error)
        }
    }
    async function signup(){
        errors = [];
        let data = {
            email: email,
            password: password,
            passwordConfirm: password,
            name: email.match(/^[^@]+/)![0] ?? '',
            cal_goal: 2000,
        }

        try {
            const newUser = await pb.collection('users').create(data)
            login()
        } catch (error) {
            handleError(error)
        }
    }


    function handleError(error: any){
        console.log(error.data)
        // failed login
        if (error.data.message === 'failed to authenticate'){
            errors = [...errors, 'Invalid email or password']
            return;
        }

        for(const [key, value] of Object.entries(error.data.data)){
            switch (key){
                case 'email':
                    emailEl.classList.add('input-error')
                    break;
                case 'password':
                    pwEl.classList.add('input-error')
                    break;
            }
            errors = [...errors, value.message]
        }
}

</script>

<main class="flex justify-center">
    <form on:submit|preventDefault class="flex flex-col w-[500px] my-8 text-center">
        <h1 class=" font-light text-4xl p-4 mb-3">Please log in or register</h1>
        
        <input type="text" bind:value={email} placeholder="Email" class="form-control block w-full px-4 py-2 mb-3 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"/>
        <input type="password" id="password" bind:value={password} placeholder="Password" class="form-control block w-full px-4 py-2 mb-3 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"/>
        
        <button on:click={login} class="inline-block px-6 py-2.5 text-white bg-green-500 font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg transition duration-150 ease-in-out w-full mb-3">Login</button>
        <button on:click={signup} class="inline-block px-6 py-2.5 text-white bg-purple-500 font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg transition duration-150 ease-in-out w-full mb-3">Sign up</button>
        
        {#if errors}
            <ul class="text-red-500">
                {#each errors as error}
                    <li>{error}</li>
                {/each}
            </ul>
        {/if}
    </form>
</main>

<style>
    
</style>