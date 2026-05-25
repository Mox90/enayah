import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

//import { routing } from '../src/i18n./../i18n/routing'

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)
