import Pocketbase from 'pocketbase';
import { writable } from 'svelte/store'

export const pb = new Pocketbase('https://pb.sercan.co.uk/')

export const currentUser = writable(pb.authStore.model);

pb.authStore.onChange((auth) => {
    currentUser.set(pb.authStore.model)
})



