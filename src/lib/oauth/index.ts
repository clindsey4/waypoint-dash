import OAuth from "discord-oauth2";

export default new OAuth({
    clientId: process.env.DISCORD_CLIENT_ID || '',
    clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    redirectUri: 'http://localhost:3000/api/oauth'
})