// enayah-frontend/src/app/[locale]/(auth)/login/page.tsx

import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'

import { cn } from '@/lib/utils'
import AnimatedLoginHeadline from '@/components/animations/animated-login-headline'
import Login from '@/modules/iam/components/auth/login-form'

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
          className='relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-32 sm:px-8 lg:min-h-screen lg:px-12 lg:py-10 xl:px-20'
        >
          {/* ====================================================== */}
          {/* MOBILE / TABLET FULL-SCREEN BACKGROUND                 */}
          {/* ====================================================== */}
          <div
            className={cn(
              'absolute inset-0 from-emerald-950 via-slate-950 to-black lg:hidden',
              isRtl ? 'bg-gradient-to-bl' : 'bg-gradient-to-br',
            )}
          />

          {/* MOBILE / TABLET GLOWS */}

          {/* Top glow follows reading direction */}
          <div className='pointer-events-none absolute -start-32 -top-32 size-[28rem] rounded-full bg-emerald-500/10 blur-3xl lg:hidden' />

          {/* Bottom glow on opposite side */}
          <div className='pointer-events-none absolute -bottom-40 -end-24 size-[32rem] rounded-full bg-emerald-400/10 blur-3xl lg:hidden' />

          {/* Center ambient light */}
          <div className='pointer-events-none absolute start-[30%] top-[35%] size-80 rounded-full bg-white/[0.025] blur-3xl lg:hidden' />

          {/* ====================================================== */}
          {/* DESKTOP BACKGROUND                                     */}
          {/* ====================================================== */}
          <div className='absolute inset-0 hidden bg-gradient-to-br from-background via-background to-muted/20 lg:block' />

          {/* ====================================================== */}
          {/* MOBILE / TABLET TOP BRAND                              */}
          {/* LTR: top-left                                          */}
          {/* RTL: top-right                                         */}
          {/* ====================================================== */}
          <div className='absolute start-5 top-5 z-20 flex items-center gap-3 sm:start-8 sm:top-8 sm:gap-4 lg:hidden'>
            <div className='relative size-14 shrink-0 overflow-hidden rounded-full bg-white p-1 shadow-xl ring-1 ring-white/20 sm:size-16'>
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
              <p className='text-xs font-medium text-white/70 sm:text-sm'>
                {t('branding.ministry')}
              </p>

              <h1 className='mt-0.5 text-base font-bold tracking-tight text-white sm:text-xl'>
                {t('branding.hospital')}
              </h1>
            </div>
          </div>

          {/* ====================================================== */}
          {/* MOBILE / TABLET BOTTOM LOGO                            */}
          {/* LTR: bottom-right                                      */}
          {/* RTL: bottom-left                                       */}
          {/* ====================================================== */}
          <div className='absolute bottom-5 end-5 z-20 sm:bottom-8 sm:end-8 lg:hidden'>
            <div className='relative size-16 shrink-0 overflow-hidden rounded-full bg-white p-1 shadow-2xl ring-4 ring-white/10 sm:size-20'>
              <Image
                src='/MODHS3.png'
                alt={t('branding.hospital')}
                fill
                sizes='80px'
                className='object-contain'
              />
            </div>
          </div>

          {/* ====================================================== */}
          {/* CENTER LOGIN                                           */}
          {/* ====================================================== */}
          <div className='relative z-10 w-full max-w-md'>
            <div className='rounded-3xl border border-white/10 bg-background/95 p-6 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-8 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none'>
              <Login />
            </div>

            <p className='mt-8 text-center text-xs text-white/40 lg:text-muted-foreground'>
              © {new Date().getFullYear()} {t('branding.hospital')}
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default LoginPage

// import Image from 'next/image'
// import { getLocale, getTranslations } from 'next-intl/server'

// import LoginForm from '@/modules/iam/components/auth/login-form'
// import { cn } from '@/lib/utils'
// import AnimatedLoginHeadline from '@/components/animations/animated-login-headline'

// const LoginPage = async () => {
//   const locale = await getLocale()
//   const t = await getTranslations('auth')

//   const isRtl = locale === 'ar'

//   return (
//     <main className='min-h-screen bg-background antialiased selection:bg-emerald-500/30'>
//       <div className='grid min-h-screen lg:grid-cols-[1.1fr_0.9fr] xl:grid-cols-[1.15fr_0.85fr]'>
//         {/* BRANDING PANEL */}
//         <section
//           dir={isRtl ? 'rtl' : 'ltr'}
//           className='relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col border-e border-white/5'
//         >
//           {/* PREMIUM BASE GRADIENT */}
//           <div
//             className={cn(
//               'absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black',
//               isRtl ? 'bg-gradient-to-bl' : 'bg-gradient-to-br',
//             )}
//           />

//           {/* SOPHISTICATED DOT GRID TEXTURE */}
//           <div className='absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]' />

//           {/* DYNAMIC AMBIENT GLOWS */}
//           <div
//             className={cn(
//               'absolute size-[32rem] rounded-full bg-emerald-500/10 blur-[120px] mix-blend-screen transition-all duration-1000',
//               isRtl ? '-top-32 -end-32' : '-top-32 -start-32',
//             )}
//           />

//           <div
//             className={cn(
//               'absolute size-[36rem] rounded-full bg-emerald-400/5 blur-[140px] mix-blend-screen',
//               isRtl ? '-bottom-40 -start-24' : '-bottom-40 -end-24',
//             )}
//           />

//           <div className='absolute start-[25%] top-[30%] size-[24rem] rounded-full bg-white/[0.02] blur-[100px]' />

//           {/* CONTENT CONTAINER */}
//           <div className='relative z-10 flex h-full flex-col px-12 py-10 xl:px-20 xl:py-16 justify-between'>
//             {/* TOP HEADER */}
//             <div className='flex items-center gap-4 group cursor-default'>
//               <div className='relative size-14 shrink-0 overflow-hidden rounded-2xl bg-white/90 p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.3)] ring-1 ring-white/20 backdrop-blur-sm transition-all duration-300 group-hover:scale-[1.02] group-hover:ring-emerald-400/30'>
//                 <Image
//                   src='/MODHS.jpg'
//                   alt={t('branding.ministry')}
//                   fill
//                   priority
//                   sizes='56px'
//                   className='object-contain p-0.5'
//                 />
//               </div>

//               <div className='text-start transition-transform duration-300'>
//                 <p className='text-xs font-semibold tracking-wider text-emerald-400/80 uppercase'>
//                   {t('branding.ministry')}
//                 </p>
//                 <h1 className='mt-0.5 text-lg font-bold tracking-tight text-white/90'>
//                   {t('branding.hospital')}
//                 </h1>
//               </div>
//             </div>

//             {/* CENTER BRANDING CALLOUT */}
//             <div className='flex flex-1 items-center py-20'>
//               <div className='max-w-xl text-start'>
//                 <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium tracking-wide text-emerald-300/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-xl'>
//                   <span className='size-1.5 rounded-full bg-emerald-400 animate-pulse' />
//                   {t('branding.systemName')}
//                 </div>

//                 <AnimatedLoginHeadline
//                   headline1={t('branding.headline1')}
//                   headline2={t('branding.headline2')}
//                   isRtl={isRtl}
//                 />

//                 <p className='mt-6 max-w-lg text-base leading-relaxed text-slate-400/90 font-normal'>
//                   {t('branding.description')}
//                 </p>
//               </div>
//             </div>

//             {/* BOTTOM METADATA */}
//             <div className='flex items-center justify-between border-t border-white/5 pt-8'>
//               <div className='text-start'>
//                 <p className='text-sm font-semibold tracking-wide text-white/90'>
//                   {t('branding.shortName')}
//                 </p>
//                 <p className='mt-0.5 text-xs text-slate-500 font-medium'>
//                   {t('branding.hospital')}
//                 </p>
//               </div>

//               <div className='relative size-16 shrink-0 overflow-hidden rounded-2xl bg-white/90 p-1.5 shadow-2xl ring-1 ring-white/10 backdrop-blur-md'>
//                 <Image
//                   src='/MODHS3.png'
//                   alt={t('branding.hospital')}
//                   fill
//                   sizes='64px'
//                   className='object-contain p-0.5'
//                 />
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* LOGIN PANEL */}
//         <section
//           dir={isRtl ? 'rtl' : 'ltr'}
//           className='relative flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24 bg-background'
//         >
//           {/* Subtle light mode texture contrast */}
//           <div className='absolute inset-0 bg-[radial-gradient(at_bottom_right,_var(--tw-gradient-stops))] from-emerald-500/[0.02] via-transparent to-transparent pointer-events-none' />

//           <div className='relative z-10 w-full max-w-md space-y-8'>
//             {/* MOBILE BRANDING */}
//             <div className='mb-10 flex flex-col items-center justify-center text-center lg:hidden space-y-4'>
//               <div className='relative size-16 overflow-hidden rounded-2xl border border-muted bg-card shadow-md p-1.5'>
//                 <Image
//                   src='/MODHS3.png'
//                   alt={t('branding.hospital')}
//                   fill
//                   priority
//                   sizes='64px'
//                   className='object-contain'
//                 />
//               </div>

//               <div className='space-y-1'>
//                 <p className='text-xl font-bold tracking-tight text-foreground'>
//                   {t('branding.shortName')}
//                 </p>
//                 <p className='text-xs font-medium text-muted-foreground bg-muted/60 px-3 py-1 rounded-full inline-block'>
//                   {t('branding.systemShortName')}
//                 </p>
//               </div>
//             </div>

//             {/* FORM CONTAINER */}
//             <div className='bg-card/50 sm:border sm:border-border/60 sm:rounded-2xl sm:p-8 sm:shadow-[0_8px_30px_rgb(0,0,0,0.02)] sm:backdrop-blur-sm'>
//               <LoginForm />
//             </div>

//             {/* FOOTER */}
//             <p className='text-center text-xs tracking-wide text-muted-foreground/70 font-medium'>
//               © {new Date().getFullYear()} {t('branding.hospital')}
//             </p>
//           </div>
//         </section>
//       </div>
//     </main>
//   )
// }

// export default LoginPage
