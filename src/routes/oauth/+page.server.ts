
import { redirect } from "@sveltejs/kit";

export async function load ({locals, cookies, url}) {

    const redirectURL = `${url.origin}/oauth`;
    const expectedState = cookies.get('state')!;
    const expectedVerifier = cookies.get('verifier')!;
    const provider = cookies.get('provider')!;
    
    const state = await url.searchParams.get('state')!;
    const code = await url.searchParams.get('code')!;

    
    if (state !== expectedState) {
        console.log('state mismatch')
        // throw redirect(303, '/login')
    }
    cookies.delete('state')
    cookies.delete('verifier')
    cookies.delete('provider')

    return {
        provider, 
        code,
        expectedVerifier,
        redirectURL,
   }
}
