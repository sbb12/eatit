<script lang="ts">
    import { redirect } from '@sveltejs/kit';
    import { pb } from '../../lib/pb/pocketbase';
    import { onMount } from 'svelte';

    export let data;
    console.log(data)

    const attempt = async () => {
        console.log('trying to auth')
        try {
            const user = await pb.collection('users').authWithOAuth2Code(
                data.provider, 
                data.code,
                data.expectedVerifier,
                data.redirectURL,
                    {name: 'Gman', calorie_goal: 2000}
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