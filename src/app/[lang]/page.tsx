import { FilledButton } from "@/components/material/filled-button"
import { Icon } from "@/components/material/icon"
import getDatabase from "@/data"
import { Databases } from "@/data/types"
import { getActiveSession, oauth } from "@/lib/oauth"
import { Locale, getDictionary } from "@/localization"
import { cookies } from "next/headers"

export default async function Home(
  {
    params
  }: {
    params: {
      lang: Locale
    }
  }
) {
  const session = await getActiveSession(cookies())
  const user = session === null ? null : await oauth.getUser(session.accessToken)

  const locale = params.lang
  const langDict = await getDictionary(locale)
  return (
    <article className="w-full h-fit flex flex-col gap-5 justify-start items-center">
      {/* Main Header Section */}
      <section className="w-full flex flex-col justify-start items-center gap-8 md:mt-28 mt-10 text-on-surface">
        <h1 className="md:text-6xl font-extrabold text-4xl text-center">{langDict.home_header_title}</h1>
        <h3 className="text-center text-2xl text-on-surface-variant max-w-3xl">{langDict.home_header_description}</h3>

        <FilledButton href={'/api/oauth'}>{langDict.home_header_get_started}</FilledButton>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-4xl flex flex-col justify-start items-center gap-5 mt-16 text-on-surface">
        <h2 className="text-3xl font-bold mb-5">{langDict.home_features_title}</h2>
        <FeatureList>
          <FeatureCard
            icon='close'
            title={langDict.home_features_admin_title}
            description={langDict.home_features_admin_description}
          />
          <FeatureCard
            icon='close'
            title={langDict.home_features_fun_title}
            description={langDict.home_features_fun_description}
          />
          <FeatureCard
            icon='close'
            title={langDict.home_features_music}
            description={langDict.home_features_music_description}
          />
        </FeatureList>
        <FeatureList>
          <FeatureCard
            icon='close'
            title={langDict.home_features_weather_title}
            description={langDict.home_features_weather_description}
          />
          <FeatureCard
            icon='close'
            title={langDict.home_features_github_title}
            description={langDict.home_features_github_description}
          />
        </FeatureList>
        <FilledButton href={`${locale}/about/features`}>{langDict.home_features_view_all}</FilledButton>
      </section>

    </article>
  )
}

function FeatureList(
  {
    children
  }: {
    children?: React.ReactNode
  }
) {
  return (
    <ul className="w-full flex md:flex-row flex-col justify-center items-center gap-5">{children}</ul>
  )
}

function FeatureCard(
  {
    title,
    icon,
    description
  }: {
    title: string,
    icon: string,
    description: string
  }
) {
  return (
    <li className="flex flex-col md:w-1/3 w-full justify-start items-center gap-2 bg-surface-container-low rounded-2xl p-4">
      {/* card header */}
      <section className="flex w-full gap-2 text-on-surface justify-start items-center">
        <Icon icon={icon} />
        <h3 className="text-xl font-semibold">{title}</h3>
      </section>

      {/* Card Description */}
      <h4 className="text-base text-on-surface-variant">{description}</h4>

    </li>
  )
}