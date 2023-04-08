import Pocketbase from 'pocketbase';
import { get, writable } from 'svelte/store'

export const pb = new Pocketbase('https://pb.surgo.dev/')

export const currentUser = writable(pb.authStore.model);

pb.authStore.onChange((auth) => {
    currentUser.set(pb.authStore.model)
    console.log(pb.authStore.model)
    console.log(get(currentUser))
})

export async function validSession(){
    // const isValid = await pb.authStore.isValid
    // if ( !isValid ){
    //     console.log(isValid)
    //     pb.authStore.clear()
    //     if ( window.location.pathname !== '/'){
    //         window.location.href = '/'
    //     }
    // }
}

