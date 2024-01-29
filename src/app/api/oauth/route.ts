import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import DiscordOAuth from "discord-oauth2";

const oauth = new DiscordOAuth()

export async function GET(
    request: NextRequest
) {

    const params = request.nextUrl.searchParams
    const code = params.get('code')

    if (!code) return redirect(process.env.DISCORD_OAUTH_URL || '');

    console.log(code)

    try {
        const response = await oauth.tokenRequest({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
    
            code: code,
            scope: 'guilds',
            grantType: 'authorization_code',
    
            redirectUri: process.env.DISCORD_OAUTH_REDIRECT_URL
        })
    
        console.log(response)
    } catch (err: any) {
        console.log('Oauth2 Error', err.response, err.message, err.code)
    }
    

    return redirect('/')
}