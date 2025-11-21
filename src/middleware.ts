import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { defaultLocale, locales } from './i18n/config'

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Don't prefix the default locale (English)
  localePrefix: 'as-needed',

  // Detect locale from Accept-Language header
  localeDetection: true,
})

export default function middleware(request: NextRequest) {
  // Check for stored locale preference
  const localeCookie = request.cookies.get('NEXT_LOCALE')
  if (localeCookie?.value) {
    // Clone the request headers and add the locale preference
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-locale-preference', localeCookie.value)
  }

  return intlMiddleware(request)
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
