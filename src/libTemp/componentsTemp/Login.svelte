<script lang="ts">
	import { onMount } from "svelte";
	import { pb } from "../pb/pocketbase";
    import LoadingRings from "./LoadingRings.svelte";
    import ProviderLogin from "./ProviderLogin.svelte";
    
    let emailEl: HTMLInputElement;
    let pwEl: HTMLInputElement;
    let email:string = '';
    let password:string = '';

    let loggingIn: boolean = false;
    let signingUp: boolean = false;
    let guestLoging: boolean = false;
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

    async function guestLogin(): Promise<void> {
        resetError()
        guestLoging = true;

        try {
            await pb.collection('users').authWithPassword('guest', 'guestguest');
            loggingIn = false;
            window.location.href = '/track'
        } catch (error) {
            handleError(error)
        }
        guestLoging = false;
    }
    
    function resetError(): void{
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
            errors = [...errors, value?.message ?? 'Something went wrong. Please try again later.']
        }
    }    

</script>

<main class="flex justify-center">
    <form on:submit|preventDefault class="flex flex-col max-w-[500px] w-full px-4 my-8 text-center space-y-3">
        <h1 class=" font-semibold text-5xl p-4 mb-3 text-gray-600">Log in or register</h1>
        
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
            <input type="text" bind:this={emailEl} bind:value={email} on:keydown={resetError} placeholder="Username" class="form-control block w-full pl-12 pr-4 py-2 text-lg font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-gray-600 focus:outline-none"/>
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
            <input type="password" id="password" bind:this={pwEl} bind:value={password} on:keydown={resetError} placeholder="Password" class="form-control block w-full pl-12 pr-4 py-2 text-lg font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-gray-600 focus:outline-none"/>
        </div>


        <button on:click={login} class="inline-flex justify-center relative px-6 py-3 text-white bg-green-500 font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-green-700 hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg transition duration-150 ease-in-out w-full">
            Login 
            {#if loggingIn}
                <LoadingRings/>
            {/if}
        </button>
        <button on:click={signup} 
            class="inline-flex justify-center px-6 py-3 text-white bg-purple-500 font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-purple-700 hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg transition duration-150 ease-in-out w-full"
            title="Fill the form and click here create a new account"
        >
            Sign up
            {#if signingUp}
                <LoadingRings/>
            {/if}
        </button>
        
        {#if errors.length > 0}
            <ul class="text-red-500 w-max-[500px]">
                {#each errors as error}
                    <li>{error}</li>
                {/each}
            </ul>
        {/if}
        
        <!-- <p>or</p> -->
        
        <div class="providers grid grid-cols-2 gap-3">
            <ProviderLogin provider={'google'}>
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  height="30px" width="30px" viewBox="0 0 256 262" version="1.1" preserveAspectRatio="xMidYMid">
                    <g>
                        <path d="M255.878,133.451 C255.878,122.717 255.007,114.884 253.122,106.761 L130.55,106.761 L130.55,155.209 L202.497,155.209 C201.047,167.249 193.214,185.381 175.807,197.565 L175.563,199.187 L214.318,229.21 L217.003,229.478 C241.662,206.704 255.878,173.196 255.878,133.451" fill="#4285F4"/>
                        <path d="M130.55,261.1 C165.798,261.1 195.389,249.495 217.003,229.478 L175.807,197.565 C164.783,205.253 149.987,210.62 130.55,210.62 C96.027,210.62 66.726,187.847 56.281,156.37 L54.75,156.5 L14.452,187.687 L13.925,189.152 C35.393,231.798 79.49,261.1 130.55,261.1" fill="#34A853"/>
                        <path d="M56.281,156.37 C53.525,148.247 51.93,139.543 51.93,130.55 C51.93,121.556 53.525,112.853 56.136,104.73 L56.063,103 L15.26,71.312 L13.925,71.947 C5.077,89.644 0,109.517 0,130.55 C0,151.583 5.077,171.455 13.925,189.152 L56.281,156.37" fill="#FBBC05"/>
                        <path d="M130.55,50.479 C155.064,50.479 171.6,61.068 181.029,69.917 L217.873,33.943 C195.245,12.91 165.798,0 130.55,0 C79.49,0 35.393,29.301 13.925,71.947 L56.136,104.73 C66.726,73.253 96.027,50.479 130.55,50.479" fill="#EB4335"/>
                    </g>
                </svg>
            </ProviderLogin>
            <ProviderLogin provider={'github'}>
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="30px" width="30px" viewBox="0 0 256 250" version="1.1" preserveAspectRatio="xMidYMid">
                    <g>
                        <path d="M128.00106,0 C57.3172926,0 0,57.3066942 0,128.00106 C0,184.555281 36.6761997,232.535542 87.534937,249.460899 C93.9320223,250.645779 96.280588,246.684165 96.280588,243.303333 C96.280588,240.251045 96.1618878,230.167899 96.106777,219.472176 C60.4967585,227.215235 52.9826207,204.369712 52.9826207,204.369712 C47.1599584,189.574598 38.770408,185.640538 38.770408,185.640538 C27.1568785,177.696113 39.6458206,177.859325 39.6458206,177.859325 C52.4993419,178.762293 59.267365,191.04987 59.267365,191.04987 C70.6837675,210.618423 89.2115753,204.961093 96.5158685,201.690482 C97.6647155,193.417512 100.981959,187.77078 104.642583,184.574357 C76.211799,181.33766 46.324819,170.362144 46.324819,121.315702 C46.324819,107.340889 51.3250588,95.9223682 59.5132437,86.9583937 C58.1842268,83.7344152 53.8029229,70.715562 60.7532354,53.0843636 C60.7532354,53.0843636 71.5019501,49.6441813 95.9626412,66.2049595 C106.172967,63.368876 117.123047,61.9465949 128.00106,61.8978432 C138.879073,61.9465949 149.837632,63.368876 160.067033,66.2049595 C184.49805,49.6441813 195.231926,53.0843636 195.231926,53.0843636 C202.199197,70.715562 197.815773,83.7344152 196.486756,86.9583937 C204.694018,95.9223682 209.660343,107.340889 209.660343,121.315702 C209.660343,170.478725 179.716133,181.303747 151.213281,184.472614 C155.80443,188.444828 159.895342,196.234518 159.895342,208.176593 C159.895342,225.303317 159.746968,239.087361 159.746968,243.303333 C159.746968,246.709601 162.05102,250.70089 168.53925,249.443941 C219.370432,232.499507 256,184.536204 256,128.00106 C256,57.3066942 198.691187,0 128.00106,0 Z M47.9405593,182.340212 C47.6586465,182.976105 46.6581745,183.166873 45.7467277,182.730227 C44.8183235,182.312656 44.2968914,181.445722 44.5978808,180.80771 C44.8734344,180.152739 45.876026,179.97045 46.8023103,180.409216 C47.7328342,180.826786 48.2627451,181.702199 47.9405593,182.340212 Z M54.2367892,187.958254 C53.6263318,188.524199 52.4329723,188.261363 51.6232682,187.366874 C50.7860088,186.474504 50.6291553,185.281144 51.2480912,184.70672 C51.8776254,184.140775 53.0349512,184.405731 53.8743302,185.298101 C54.7115892,186.201069 54.8748019,187.38595 54.2367892,187.958254 Z M58.5562413,195.146347 C57.7719732,195.691096 56.4895886,195.180261 55.6968417,194.042013 C54.9125733,192.903764 54.9125733,191.538713 55.713799,190.991845 C56.5086651,190.444977 57.7719732,190.936735 58.5753181,192.066505 C59.3574669,193.22383 59.3574669,194.58888 58.5562413,195.146347 Z M65.8613592,203.471174 C65.1597571,204.244846 63.6654083,204.03712 62.5716717,202.981538 C61.4524999,201.94927 61.1409122,200.484596 61.8446341,199.710926 C62.5547146,198.935137 64.0575422,199.15346 65.1597571,200.200564 C66.2704506,201.230712 66.6095936,202.705984 65.8613592,203.471174 Z M75.3025151,206.281542 C74.9930474,207.284134 73.553809,207.739857 72.1039724,207.313809 C70.6562556,206.875043 69.7087748,205.700761 70.0012857,204.687571 C70.302275,203.678621 71.7478721,203.20382 73.2083069,203.659543 C74.6539041,204.09619 75.6035048,205.261994 75.3025151,206.281542 Z M86.046947,207.473627 C86.0829806,208.529209 84.8535871,209.404622 83.3316829,209.4237 C81.8013,209.457614 80.563428,208.603398 80.5464708,207.564772 C80.5464708,206.498591 81.7483088,205.631657 83.2786917,205.606221 C84.8005962,205.576546 86.046947,206.424403 86.046947,207.473627 Z M96.6021471,207.069023 C96.7844366,208.099171 95.7267341,209.156872 94.215428,209.438785 C92.7295577,209.710099 91.3539086,209.074206 91.1652603,208.052538 C90.9808515,206.996955 92.0576306,205.939253 93.5413813,205.66582 C95.054807,205.402984 96.4092596,206.021919 96.6021471,207.069023 Z" fill="#161614"/>
                    </g>
                </svg>
            </ProviderLogin>
        </div>

        <!-- <p>or</p>   -->

        <button on:click={guestLogin} 
            class="inline-flex justify-center px-6 py-3 text-white bg-teal-600 font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-teal-700 hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg transition duration-150 ease-in-out w-full mb-3"
            title="Fill the form and click here create a new account"
        >
            continue as guest
            {#if guestLoging}
            <div class="absolute">
                <LoadingRings/>
            </div>
            {/if}
        </button>


        <div>
            <span class="text-gray-400">no account? no problem! </span>
            <button on:click={() => {showToolTip = !showToolTip}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="mb-[-5px]">
                    <g clip-path="url(#clip0_16_180)">
                    <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C14.1217 20 16.1566 19.1571 17.6569 17.6569C19.1571 16.1566 20 14.1217 20 12C20 9.87827 19.1571 7.84344 17.6569 6.34315C16.1566 4.84285 14.1217 4 12 4C9.87827 4 7.84344 4.84285 6.34315 6.34315C4.84285 7.84344 4 9.87827 4 12C4 14.1217 4.84285 16.1566 6.34315 17.6569C7.84344 19.1571 9.87827 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z" fill="rgb(156 163 175)"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_16_180">
                    <rect width="24" height="24" fill="white"/>
                    </clipPath>
                    </defs>
                    </svg>
            </button>
            <div class="{showToolTip ? '' : 'hidden'} text-gray-700 space-y-2 mt-2 border rounded p-3" >
                <p>
                    You do not need an email to sign up. 
                </p>
                
                <p>
                    Simply enter a username and a password and click on the sign up button.
                </p>
                <p>
                    Or just click continue as guest to browse the site with limited privileges.
                </p>
                <p>
                    For a guide on how to use the site, check out our <a href="/faq">FAQ</a> page.
                </p>
            </div>
        </div>


    </form>
</main>
