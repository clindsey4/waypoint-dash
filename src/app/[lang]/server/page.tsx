import { getActiveSession, getUserGuilds, oauth } from "@/lib/oauth"
import { Locale, getDictionary } from "@/localization"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { GuildItem } from "./guild_item"
import { PartialGuild } from "discord-oauth2"

export default async function ServersPage(
    {
        params
    }: {
        params: {
            lang: Locale
        }
    }
) {
    // get the active session
    const session = await getActiveSession(cookies())
    if (session === null) return redirect('/api/oauth')

    // get a list of guilds the user is in
    const guilds = await getUserGuilds(session.accessToken)

    // get the correct language dictionary
    const locale = params.lang
    const langDict = await getDictionary(locale)

    return (
        <article className="w-full h-fit flex flex-col gap-8 justify-start items-center">
            <h1 className="mt-5 text-4xl font-extrabold text-center">{langDict.servers_title}</h1>
            <ul className="flex flex-wrap max-w-screen-lg w-full gap-5 justify-center">
                {guilds.length > 0 ? guilds?.map(guild => (
                    <GuildItem
                        key={guild.id}
                        icon={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`}
                        name={guild.name}
                        href={`server/${guild.id}`}
                    />
                )) : (
                    <h3 className="w-full text-on-surface-variant text-2xl">{langDict.servers_no_guilds}</h3>
                )}
            </ul>
        </article>
    )
}