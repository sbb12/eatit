import Pocketbase from 'pocketbase';
import { writable } from 'svelte/store'

export const pb = new Pocketbase('https://pb.surgo.dev/')

export const currentUser = writable(pb.authStore.model);

pb.authStore.onChange((auth) => {
    currentUser.set(pb.authStore.model)
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

