import { getActiveSession, getUserGuild } from "@/lib/oauth"
import { Locale, getDictionary } from "@/localization"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function ServerPage(
    {
        params
    }: {
        params: {
            lang: Locale
            guildId: string
        }
    }
) {
    // get the active session
    const session = await getActiveSession(cookies())
    if (session === null) return redirect('/api/oauth')

    // get the correct language dictionary
    const locale = params.lang
    const langDict = await getDictionary(locale)

    // get a list of guilds the user is in
    const guildId = params.guildId
    const guild = await getUserGuild(session.accessToken, guildId)
    if (!guild) return redirect(`/${locale}/server`)

    return (
        <article className="w-fhull h-fit flex flex-col gap-8 justify-start items-center">
            <h1 className="mt-5 text-4xl font-extrabold text-center">{guild?.name}</h1>
        </article>
    )
}