import { Locale, getDictionary } from "@/localization"
import Link from "next/link"
import { Icon } from "./material/icon"
import { getActiveSession, oauth } from "@/lib/oauth"
import { cookies } from "next/headers"
import OAuth from "discord-oauth2"
import { FilledButton } from "./material/filled-button"

export default async function Navbar(
    {
        lang,
        user
    }: {
        lang: Locale,
        user: OAuth.User | null
    }
) {
    const langDict = await getDictionary(lang)

    return (
        <header className="z-50 w-full h-16 px-7 py-2 box-border sticky top-0 backdrop-blur backdrop-saturate-200 before:w-full before:h-full before:absolute bg-[linear-gradient(var(--md-sys-color-background),transparent)] before:bg-background before:opacity-80 before:z-40 before:top-0 before:left-0">
            <nav className='z-40 relative w-full h-full flex items-center gap-5 m-auto'>
                <ul className='flex-1 flex items-center justify-start gap-5'>
                    {/* favicon */}
                    <Link href={`/${lang}`} className="flex gap-3 items-center">
                        <Icon icon="explore" />
                        <h3 className="text-on-background text-xl font-semibold">{langDict.website_title}</h3>
                    </Link>
                </ul>
                {user === null ? <FilledButton href='/api/oauth'>{langDict.nav_login}</FilledButton>
                    : <Link href={`/${lang}/server`} className="text-base bg-surface-container text-on-primary px-3 h-[40px] rounded-full flex gap-3 items-center justify-center relative before:bg-on-primary before:transition-opacity before:absolute before:w-full before:h-full before:left-0 before:top-0 before:rounded-full before:opacity-0 before:hover:opacity-[0.12] transition-opacity">
                        <h3 className="text-center text-lg text-on-surface-variant max-w-3xl mr-2">{user.username}</h3>
                        <img
                            className="rounded-full"
                            width={30}
                            height={30}
                            src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`}
                        />
                    </Link>
                }
            </nav>
        </header>
    )
}