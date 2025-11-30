import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Create localized versions of Link, redirect, usePathname, useRouter, getPathname
// These will automatically handle locale prefixes based on the current locale
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
