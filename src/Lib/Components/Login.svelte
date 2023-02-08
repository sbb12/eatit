<script lang="ts">
	import { currentUser, pb } from "../pb/pocketbase";

    let email = '';
    let password = '';

    async function login(){
        try {
            await pb.collection('users').authWithPassword(email, password);
        } catch (error) {
            console.log(error);
        }
    }
    async function signup(){

        let data = {
            email: email,
            password: password,
            passwordConfirm: password,
            name: email.match(/^[^@]+/)![0] ?? '',
        }

        try {
            const newUser = await pb.collection('users').create(data)
            login()
        } catch (error) {
            console.log(error)
        }
    }

</script>


<form on:submit|preventDefault>

    <label for="email">Email</label>
    <input type="email" bind:value={email} />

    <label for="password">Password</label>
    <input type="password" id="password" bind:value={password} />

    <button on:click={login}>Login</button>
    <button on:click={signup}>Sign up</button>

</form>