import { FilledButton } from "@/components/material/filled-button"
import { Locale, getDictionary } from "@/localization"

export default async function Home(
  {
    params
  }: {
    params: {
      lang: Locale
    }
  }
) {
  const locale = params.lang
  const langDict = await getDictionary(locale)
  return (
    <article className="w-full h-fit flex flex-col gap-5 justify-start items-center">

      {/* Main Header Section */}
      <section className="w-full flex flex-col justify-start items-center gap-8 md:mt-28 mt-10 text-on-surface">
        <h1 className="md:text-6xl font-extrabold text-4xl text-center">{langDict.home_header_title}</h1>
        <h2 className="text-center text-2xl text-on-surface-variant max-w-3xl">{langDict.home_header_description}</h2>
        <FilledButton href={`${locale}/login`}>{langDict.home_header_get_started}</FilledButton>
      </section>

    </article>
  )
}