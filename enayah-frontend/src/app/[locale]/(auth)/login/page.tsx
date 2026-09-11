// enayah-frontend/src/app/[locale]/(auth)/login/page.tsx

// import React from 'react'
// import LoginForm from '@/modules/iam/components/auth/login-form'

// const page = () => {
//   return (
//     <div className='flex min-h-screen items-center justify-center bg-muted/30 p-4'>
//       <LoginForm />
//     </div>
//   )
// }

// export default page

import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'

import LoginForm from '@/modules/iam/components/auth/login-form'
import { cn } from '@/lib/utils'
import AnimatedLoginHeadline from '@/components/animations/animated-login-headline'

const LoginPage = async () => {
  const locale = await getLocale()
  const t = await getTranslations('auth')

  const isRtl = locale === 'ar'

  return (
    <main className='min-h-screen bg-background'>
      <div className='grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]'>
        {/* BRANDING PANEL */}
        <section
          dir={isRtl ? 'rtl' : 'ltr'}
          className='relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col'
        >
          {/* BACKGROUND */}
          {/* <div className='absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-950 to-black' /> */}
          <div
            className={cn(
              'absolute inset-0 from-emerald-950 via-slate-950 to-black',
              isRtl ? 'bg-gradient-to-bl' : 'bg-gradient-to-br',
            )}
          />

          {/* DECORATIVE GLOW
          <div className='absolute -start-32 -top-32 size-[28rem] rounded-full bg-emerald-500/10 blur-3xl' />

          <div className='absolute -bottom-40 -end-24 size-[32rem] rounded-full bg-emerald-400/10 blur-3xl' />

          <div className='absolute start-1/3 top-1/3 size-80 rounded-full bg-white/[0.03] blur-3xl' /> */}
          {/* TOP BRAND GLOW */}
          <div className='absolute -start-32 -top-32 size-[28rem] rounded-full bg-emerald-500/10 blur-3xl' />

          {/* BOTTOM BRAND GLOW */}
          <div className='absolute -bottom-40 -end-24 size-[32rem] rounded-full bg-emerald-400/10 blur-3xl' />

          {/* CENTER AMBIENT LIGHT */}
          <div className='absolute start-[30%] top-[35%] size-80 rounded-full bg-white/[0.025] blur-3xl' />

          {/* CONTENT */}
          <div className='relative z-10 flex h-full flex-col px-12 py-10 xl:px-16 xl:py-14'>
            {/* TOP */}
            <div className='flex items-center gap-4'>
              <div className='relative size-16 shrink-0 overflow-hidden rounded-full bg-white p-1 shadow-xl ring-1 ring-white/20'>
                <Image
                  src='/MODHS.jpg'
                  alt={t('branding.ministry')}
                  fill
                  priority
                  sizes='64px'
                  className='object-contain'
                />
              </div>

              <div className='text-start'>
                <p className='text-sm font-medium text-white/70'>
                  {t('branding.ministry')}
                </p>

                <h1 className='mt-0.5 text-xl font-bold tracking-tight text-white'>
                  {t('branding.hospital')}
                </h1>
              </div>
            </div>

            {/* CENTER */}
            <div className='flex flex-1 items-center'>
              <div className='max-w-xl text-start'>
                <div className='mb-7 inline-flex items-center rounded-full border border-white/15 bg-white/[0.07] px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 backdrop-blur-md'>
                  {t('branding.systemName')}
                </div>

                {/* <h2 className='text-4xl font-bold leading-[1.15] tracking-tight text-white xl:text-5xl'>
                  {t('branding.headline1')}
                  <br />
                  {t('branding.headline2')}
                </h2> */}
                <AnimatedLoginHeadline
                  headline1={t('branding.headline1')}
                  headline2={t('branding.headline2')}
                  isRtl={isRtl}
                />

                <p className='mt-6 max-w-lg text-base leading-7 text-white/65'>
                  {t('branding.description')}
                </p>
              </div>
            </div>

            {/* BOTTOM */}
            <div className='flex items-end justify-between border-t border-white/10 pt-8'>
              <div className='text-start'>
                <p className='text-sm font-semibold text-white'>
                  {t('branding.shortName')}
                </p>

                <p className='mt-1 text-xs text-white/50'>
                  {t('branding.hospital')}
                </p>
              </div>

              <div className='relative size-20 shrink-0 overflow-hidden rounded-full bg-white p-1 shadow-2xl ring-4 ring-white/10'>
                <Image
                  src='/MODHS3.png'
                  alt={t('branding.hospital')}
                  fill
                  sizes='80px'
                  className='object-contain'
                />
              </div>
            </div>
          </div>
        </section>

        {/* LOGIN PANEL */}
        <section
          dir={isRtl ? 'rtl' : 'ltr'}
          className='relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-20'
        >
          <div className='absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20' />

          <div className='relative z-10 w-full max-w-md'>
            {/* MOBILE BRANDING */}
            <div className='mb-8 flex items-center justify-center gap-3 lg:hidden'>
              <div className='relative size-12 overflow-hidden rounded-full border bg-background shadow-sm'>
                <Image
                  src='/MODHS3.png'
                  alt={t('branding.hospital')}
                  fill
                  priority
                  sizes='48px'
                  className='object-contain'
                />
              </div>

              <div className='text-start'>
                <p className='text-lg font-bold leading-none'>
                  {t('branding.shortName')}
                </p>

                <p className='mt-1 text-xs text-muted-foreground'>
                  {t('branding.systemShortName')}
                </p>
              </div>
            </div>

            <LoginForm />

            <p className='mt-8 text-center text-xs text-muted-foreground'>
              © {new Date().getFullYear()} {t('branding.hospital')}
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default LoginPage
