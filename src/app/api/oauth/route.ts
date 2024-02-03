import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { getActiveSession, oauth, saveToken } from "@/lib/oauth";
import { cookies } from "next/headers";
import { insertSession } from "@/data/botData";

export async function GET(
    request: NextRequest
) {
    const params = request.nextUrl.searchParams
    const code = params.get('code')

    const cookie = cookies()

    // check if the user already has a session
    if (await getActiveSession(cookie)) return redirect('/');

    // ensure that the query has a valid code.
    if (!code) return redirect(process.env.DISCORD_OAUTH_URL || '');

    try {
        // get the access token & refresh token
        const response = await oauth.tokenRequest({
            code: code,
            scope: 'identity guilds',
            grantType: 'authorization_code',
        })

        await saveToken(
            cookie, 
            response
        )
    } catch (err: any) {
        console.log('Oauth2 Error', err.response, err.message, err.code)
    }
    
    return redirect('/')
}