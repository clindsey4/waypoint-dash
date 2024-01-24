import NextAuth from "next-auth/next"
import Discord from "next-auth/providers/discord"

const handlers = NextAuth({
    providers: [
        Discord({
            clientId: process.env.DISCORD_CLIENT_ID || '',
            clientSecret: process.env.DISCORD_CLIENT_SECRET || ''
        })
    ]
})

export { handlers as GET, handlers as POST }