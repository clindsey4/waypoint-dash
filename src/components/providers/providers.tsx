'use client'
import { LanguageDictionary } from "@/localization";
import { ThemeProvider } from "next-themes";
import { LanguageDictionaryProvider } from "./language-dict-provider";

export function Providers(
    {
        dictionary,
        children
    }: {
        dictionary: LanguageDictionary,
        children: React.ReactNode
    }
) {
    return (
        <ThemeProvider>
            <LanguageDictionaryProvider dictionary={dictionary}>
                {children}
            </LanguageDictionaryProvider>
        </ThemeProvider>
    )
}