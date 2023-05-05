<script lang="ts">
	import { pb } from "../pb/pocketbase";
    import LoadingRings from "./LoadingRings.svelte";

    let emailEl: HTMLInputElement;
    let pwEl: HTMLInputElement;
    let email:string = '';
    let password:string = '';

    let loggingIn: boolean = false;
    let signingUp: boolean = false;
    let showToolTip: boolean = false;

    let errors: string[] = [];

    async function login(): Promise<void> {
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
            loggingIn = false;
            window.location.href = '/track'
        } catch (error) {
            handleError(error)
        }
        loggingIn = false;
    }


    async function signup(): Promise<void> {
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
                calorie_goal: 2000,
            }
        } else {
            data = {
                username: email,
                password: password,
                passwordConfirm: password,
                name: email,
                calorie_goal: 2000,
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

    function resetError(): void{
        errors = [];
        emailEl.classList.remove('input-error')
        pwEl.classList.remove('input-error')

    }

    function handleError(error){
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
    <form on:submit|preventDefault class="flex flex-col max-w-[500px] w-full px-4 my-8 text-center">
        <h1 class=" font-light text-4xl p-4 mb-3">Log in or register</h1>
        
        <div class="relative text-gray-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="absolute top-3 left-4">
                <g clip-path="url(#clip0_16_47)">
                    <path d="M4 22C4 19.8783 4.84285 17.8434 6.34315 16.3431C7.84344 14.8429 9.87827 14 12 14C14.1217 14 16.1566 14.8429 17.6569 16.3431C19.1571 17.8434 20 19.8783 20 22H18C18 20.4087 17.3679 18.8826 16.2426 17.7574C15.1174 16.6321 13.5913 16 12 16C10.4087 16 8.88258 16.6321 7.75736 17.7574C6.63214 18.8826 6 20.4087 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z" 
                    fill="rgb(156 163 175)" stroke-width="0.5"/>
                </g>
                <defs>
                <clipPath id="clip0_16_47">
                    <rect width="24" height="24" fill="white"/>
                </clipPath>
                </defs>
            </svg>
                
            <input type="text" bind:this={emailEl} bind:value={email} on:keydown={resetError} placeholder="Username" class="form-control block w-full pl-12 pr-4 py-2 mb-3 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"/>
        </div>
        
        
        <div class="relative">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="absolute top-3 left-4">
                    <g clip-path="url(#clip0_16_665)">
                    <path d="M12.917 13C12.6623 14.4801 11.8619 15.8108 10.6739 16.7296C9.48593 17.6484 7.99666 18.0885 6.50009 17.9629C5.00352 17.8373 3.60841 17.1552 2.59016 16.0513C1.57191 14.9474 1.00452 13.5018 1 12C0.998629 10.4946 1.56319 9.0437 2.58168 7.93515C3.60017 6.8266 4.99816 6.14141 6.49828 6.01553C7.9984 5.88965 9.49103 6.33228 10.68 7.25559C11.869 8.1789 12.6675 9.51543 12.917 11H23V13H21V17H19V13H17V17H15V13H12.917ZM7 16C8.06087 16 9.07828 15.5786 9.82843 14.8284C10.5786 14.0783 11 13.0609 11 12C11 10.9391 10.5786 9.92171 9.82843 9.17157C9.07828 8.42142 8.06087 7.99999 7 7.99999C5.93914 7.99999 4.92172 8.42142 4.17158 9.17157C3.42143 9.92171 3 10.9391 3 12C3 13.0609 3.42143 14.0783 4.17158 14.8284C4.92172 15.5786 5.93914 16 7 16Z" 
                    fill="rgb(156 163 175)"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_16_665">
                    <rect width="24" height="24" fill="white"/>
                    </clipPath>
                    </defs>
                </svg>
            <input type="password" id="password" bind:this={pwEl} bind:value={password} on:keydown={resetError} placeholder="Password" class="form-control block w-full pl-12 pr-4 py-2 mb-3 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"/>
        </div>


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

        <div>
            <span class="text-gray-400">no account? no problem! </span>
            <button on:click={() => {showToolTip = !showToolTip}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_16_180)">
                    <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C14.1217 20 16.1566 19.1571 17.6569 17.6569C19.1571 16.1566 20 14.1217 20 12C20 9.87827 19.1571 7.84344 17.6569 6.34315C16.1566 4.84285 14.1217 4 12 4C9.87827 4 7.84344 4.84285 6.34315 6.34315C4.84285 7.84344 4 9.87827 4 12C4 14.1217 4.84285 16.1566 6.34315 17.6569C7.84344 19.1571 9.87827 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z" fill="rgb(55 65 81)"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_16_180">
                    <rect width="24" height="24" fill="white"/>
                    </clipPath>
                    </defs>
                    </svg>
            </button>
            <div class="{showToolTip ? '' : 'hidden'} text-gray-700 space-y-2" >
                <p>
                    You do not need an email to sign up. 
                </p>
                
                <p>
                    Simply enter a username and a password and click on the sign up button.
                </p>
                <p>
                    For a guide on how to use the site, check out our <a href="/faq">FAQ</a> page.
                </p>
            </div>
        </div>
    </form>
</main>
