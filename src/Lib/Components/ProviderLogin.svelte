<script lang="ts">
    import { pb } from "../../lib/pb/pocketbase";
    export let provider: string;

    async function login() {
        const url = new URL(window.location.href);

        const authMethods = await pb.collection('users').listAuthMethods();
        const redirectURL = `${url.origin}/oauth`;
        const AuthProvider = authMethods.authProviders.find((p) => p.name === provider)!;
        const authProviderRedirect = `${AuthProvider.authUrl}${redirectURL}`;
        const state = AuthProvider.state;
        const verifier = AuthProvider.codeVerifier        

        localStorage.setItem('authState', state);
        localStorage.setItem('authVerifier', verifier);
        localStorage.setItem('authProvider', provider);

        window.location.href = authProviderRedirect;
    }

</script>

<!-- <div class="w-full bg-gray-100 rounded py-2 flex border border-gray-300  hover:bg-gray-200  transition"  method="POST" action="?/OAuth2" > -->
<div class="w-full bg-gray-100 rounded py-2 flex border border-gray-300  hover:bg-gray-200  transition" >
    <input type="hidden" name="provider" value="{provider}">
    <button class="w-full inline-flex justify-center items-center"  on:click={login}>
        <slot />
        <p class="pl-4 hover:scale-100">{provider}</p>
    </button>
</div> 