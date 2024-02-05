export function GuildItem(
    {
        icon,
        name,
        href
    }: {
        icon: string
        name: string
        href: string
    }
) {
    return (
        <li className="flex flex-col gap-5 w-full max-w-36 h-fit">
            <a href={href} className="w-full">
                <img
                    className="rounded-3xl w-full aspect-square"
                    src={icon}
                />
            </a>
            <a href={href}>
                <h3 className="text-xl font-semibold text-center text-on-surface-variant hover:text-on-surface transition-colors">
                    {name}
                </h3>
            </a>
        </li>
    )
}