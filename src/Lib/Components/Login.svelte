<script lang="ts">
	import { pb } from "../pb/pocketbase";
    import LoadingRings from "./LoadingRings.svelte";

    let emailEl: HTMLInputElement;
    let pwEl: HTMLInputElement;
    let email = '';
    let password = '';

    let loggingIn: boolean = false;
    let signingUp: boolean = false;

    let errors: string[] = [];

    async function login(){
        resetError()
        loggingIn = true;

        if (!email || !password){
            errors = [...errors, 'Please fill all fields']
            if (!email) emailEl.classList.add('input-error')
            if (!password) pwEl.classList.add('input-error')    
            loggingIn = false;
            return;
        }

        try {
            await pb.collection('users').authWithPassword(email, password);
            console.log('logged in')
            loggingIn = false;
            window.location.href = '/track'
        } catch (error) {
            handleError(error)
        }
        loggingIn = false;
    }


    async function signup(){
        resetError()
        signingUp = true;

        if (!email || !password){
            errors = [...errors, 'Please fill all fields']
            if (!email) emailEl.classList.add('input-error')
            if (!password) pwEl.classList.add('input-error')    
            signingUp = false;
            return;
        }
        
        let data;
        // check if input is an email
        if (email.includes('@')){
            data = {
                email: email,
                password: password,
                passwordConfirm: password,
                name: email.match(/^[^@]+/)![0] ?? '',
                cal_goal: 2000,
            }
        } else {
            data = {
                username: email,
                password: password,
                passwordConfirm: password,
                name: email,
                cal_goal: 2000,
            }
        }
        
        try {
            const newUser = await pb.collection('users').create(data)
            login()
            signingUp = false;
        } catch (error) {
            handleError(error)
            signingUp = false;
        }
        signingUp = false;
        
    }

    function logOut(){
        pb.authStore.clear()
    }

    function resetError(){
        errors = [];
        emailEl.classList.remove('input-error')
        pwEl.classList.remove('input-error')

    }


    function handleError(error: any){
        console.log(error.data.message)
        // failed login
        if (error.data.message == 'Failed to authenticate.'){
            console.log('auth error')
            errors = [...errors, 'Could not authenticate. Please check your email and password.']
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
    <form on:submit|preventDefault class="flex flex-col w-max-[500px] px-4 my-8 text-center">
        <h1 class=" font-light text-4xl p-4 mb-3">Please log in or register</h1>
        
        <input type="text" bind:this={emailEl} bind:value={email} on:keydown={resetError} placeholder="Username" class="form-control block w-full px-4 py-2 mb-3 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"/>
        <input type="password" id="password" bind:this={pwEl} bind:value={password} on:keydown={resetError} placeholder="Password" class="form-control block w-full px-4 py-2 mb-3 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"/>
        
        <button on:click={login} class="inline-flex justify-center relative px-6 py-2.5 text-white bg-green-500 font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg transition duration-150 ease-in-out w-full mb-3">
            Login 
            {#if loggingIn}
                <LoadingRings/>
            {/if}
        </button>
        <button on:click={signup} 
            class="inline-flex justify-center px-6 py-2.5 text-white bg-purple-500 font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg transition duration-150 ease-in-out w-full mb-3"
            title="Fill the form and click here create a new account"
        >
            Sign up
            {#if signingUp}
                <LoadingRings/>
            {/if}
        </button>
        
        {#if errors}
            <ul class="text-red-500 w-max-[500px]">
                {#each errors as error}
                    <li>{error}</li>
                {/each}
            </ul>
        {/if}
    </form>
</main>
