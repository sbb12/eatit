import PocketBase from 'pocketbase';

export const handle = async ({ event, resolve }) => {
    event.locals.pb = new PocketBase('https://pb.sercan.co.uk');
    const response = await resolve(event);
    return response;
};