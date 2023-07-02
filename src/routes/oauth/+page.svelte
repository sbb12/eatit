<script lang="ts">
    import { pb} from '../../lib/pb/pocketbase';
    import { onMount } from 'svelte';
   
   

    const attempt = async () => {

        const expectedState = localStorage.getItem('authState');
        const expectedVerifier = localStorage.getItem('authVerifier');
        const provider = localStorage.getItem('authProvider');

        localStorage.removeItem('authState');
        localStorage.removeItem('authVerifier');
        localStorage.removeItem('authProvider');

        console.log('trying to auth')
        try {
            const url = new URL(window.location.href)
            const redirectURL = `${url.origin}/oauth`;
            const state = await url.searchParams.get('state')!;
            const code = await url.searchParams.get('code')!;
        
            if (state !== expectedState) {
                console.log('state mismatch')
                window.location.href = '/login'
            }

            const user = await pb.collection('users').authWithOAuth2Code(
                provider!, 
                code,
                expectedVerifier!,
                redirectURL,
                {name: 'provider', calorie_goal: 2000}
            )

            window.location.href = '/track'
                
        } catch (error) {
            console.log('error ', error)
            window.location.href = '/login'
        }
    }

    onMount(() => {
        attempt()
    })

</script>

<svelte:window on:load={attempt} />

<div>
    <div class="p-10 w-full">
        <h1 class="text-center">Authenticating...</h1>
    </div>
</div>
```