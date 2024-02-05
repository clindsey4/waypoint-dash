import { getActiveSession, oauth } from "@/lib/oauth"
import { Locale, getDictionary } from "@/localization"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { GuildItem } from "./guild_item"

export default async function ServersPage(
    {
        params
    }: {
        params: {
            lang: Locale
        }
    }
) {
    const session = await getActiveSession(cookies())
    if (session === null) return redirect('/api/oauth')
    const guilds = session === null ? null : await oauth.getUserGuilds(session.accessToken)

    const locale = params.lang
    const langDict = await getDictionary(locale)

    return (
        <article className="w-full h-fit flex flex-col gap-8 justify-start items-center">
            <h1 className="mt-5 text-4xl font-extrabold text-center">Select a Server</h1>
            <ul className="flex flex-wrap max-w-screen-lg w-full gap-5 justify-center">
                {guilds?.map(guild => (
                    <GuildItem
                        icon={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`}
                        name={guild.name}
                        href={`/servers/${guild.id}`}
                    />
                ))}
            </ul>
        </article>
    )
}