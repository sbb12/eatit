import Pocketbase from 'pocketbase';

import { writable } from 'svelte/store'

export const pb = new Pocketbase('http://ec2-13-42-22-85.eu-west-2.compute.amazonaws.com/')

export const currentUser = writable(pb.authStore.model);

pb.authStore.onChange((auth) => {
    console.log('authStore.onChange', auth)
    currentUser.set(pb.authStore.model)
})


