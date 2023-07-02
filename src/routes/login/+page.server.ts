import { redirect } from '@sveltejs/kit';

export async function load({locals,url,cookies}){
    return{
    }
}

// export const actions = {
//     signup: async()=>{
//         console.log("Nope!")
//     },
//     OAuth2: async({cookies,url,request,locals})=>{

//         const data = (await request.formData())
//         const provider = data.get('provider') as string

//         const authMethods = await locals.pb.collection('users').listAuthMethods();
//         const redirectURL = `${url.origin}/oauth`;
//         const AuthProvider = authMethods.authProviders.find((p) => p.name === provider)!;
//         const authProviderRedirect = `${AuthProvider.authUrl}${redirectURL}`;
//         const state = AuthProvider.state;
//         const verifier = AuthProvider.codeVerifier        

//         cookies.set('state', state);
//         cookies.set('verifier', verifier);
//         cookies.set('provider', provider);

//         // throw redirect(302,authProviderRedirect)
//     }
// }
