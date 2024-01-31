import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { oauth } from "@/lib/oauth";

export async function GET(
    request: NextRequest
) {

    const params = request.nextUrl.searchParams
    const code = params.get('code')

    // ensure that the query has a valid code.
    if (!code) return redirect(process.env.DISCORD_OAUTH_URL || '');

    try {
        // get the access token & refresh token
        const response = await oauth.tokenRequest({
            code: code,
            scope: 'identity guilds',
            grantType: 'authorization_code',
        })

        // the date when the access token expires
        const expirationDate = new Date(new Date().getUTCMilliseconds() + response.expires_in)
        
        // store tokens in DB
        // set session_token as cookie

        console.log(response)
    } catch (err: any) {
        console.log('Oauth2 Error', err.response, err.message, err.code)
    }
    
    return redirect('/')
}