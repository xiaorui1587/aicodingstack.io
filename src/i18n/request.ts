import { getRequestConfig } from 'next-intl/server'
import { defaultLocale, locales } from './config'
import { resolveReferences } from './lib'

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale

  // Ensure that the incoming locale is valid
  if (!locale || !locales.includes(locale as (typeof locales)[number])) {
    locale = defaultLocale
  }

  // Import raw messages and resolve references centrally
  const rawMessages = (await import(`../../translations/${locale}/index.ts`)).default
  const messages = resolveReferences(rawMessages)

  return {
    locale,
    messages,
  }
})
