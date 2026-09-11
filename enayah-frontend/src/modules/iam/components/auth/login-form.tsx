// enayah-frontend/src/modules/iam/component/auth/login-form.tsx

'use client'

import React, { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import axios from 'axios'
import { Eye, EyeOff, Loader2, LockKeyhole, UserRound } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { loginRequest } from '@/modules/iam/services/auth.services'

import { useAuthStore } from '../../stores/auth.store'
import { usePermissionStore } from '../../stores/permission.store'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'

const Login = () => {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const isRtl = locale === 'ar'
  const queryClient = useQueryClient()

  const login = useAuthStore((state) => state.login)
  const setPermissions = usePermissionStore((state) => state.setPermissions)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError('')

      const response = await loginRequest({
        username,
        password,
      })

      /*
       * Stop requests and remove cached data belonging
       * to the previously authenticated user.
       */
      await queryClient.cancelQueries()
      queryClient.clear()

      /*
       * Store the newly authenticated user only after
       * the previous user's query cache has been cleared.
       */
      login(response.accessToken, response.user)

      //console.log(response.user?.roles)

      const permissions =
        response.user?.roles?.flatMap(
          (role: {
            id: string
            name: string
            permissions: [{ id: string; code: string }]
          }) =>
            role.permissions?.map(
              (perm: { id: string; code: string }) => perm.code,
            ) || [],
        ) || []

      setPermissions(permissions)

      //router.push(`/${locale}/dashboard`)
      router.replace(`/${locale}/dashboard`)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message || 'Invalid username or password',
        )
      } else {
        setError('Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className='w-full max-w-md overflow-hidden rounded-3xl border-border/60 bg-card shadow-xl shadow-black/5'>
      <CardContent className='p-0'>
        <form className='p-7 sm:p-9' onSubmit={handleLogin}>
          {/* HEADER */}
          <div className='mb-8'>
            <div className='mb-3 inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold tracking-wide text-primary'>
              {t('branding.systemName')}
            </div>

            <h1 className='text-3xl font-bold tracking-tight text-foreground'>
              {t('loginTitle')}
            </h1>

            <p className='mt-2 text-sm leading-6 text-muted-foreground'>
              {t('loginSubtitle')}
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div
              role='alert'
              className='mb-6 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive'
            >
              {error}
            </div>
          )}

          <div className='space-y-5'>
            {/* USERNAME */}
            <div className='space-y-2'>
              <label
                htmlFor='username'
                className='text-sm font-medium text-foreground'
              >
                {t('username')}
              </label>

              <div className='relative'>
                <UserRound
                  className={cn(
                    'pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground',
                    isRtl ? 'right-4' : 'left-4',
                  )}
                />

                <Input
                  id='username'
                  name='username'
                  type='text'
                  autoComplete='username'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('username')}
                  aria-invalid={Boolean(error)}
                  className={cn(
                    'h-12 rounded-xl bg-background transition-shadow focus-visible:ring-2',
                    isRtl ? 'pr-11' : 'pl-11',
                  )}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className='space-y-2'>
              <label
                htmlFor='password'
                className='text-sm font-medium text-foreground'
              >
                {t('password')}
              </label>

              <div className='relative'>
                <LockKeyhole
                  className={cn(
                    'pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground',
                    isRtl ? 'right-4' : 'left-4',
                  )}
                />

                <Input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('password')}
                  aria-invalid={Boolean(error)}
                  className='h-12 rounded-xl bg-background px-11 transition-shadow focus-visible:ring-2'
                />

                <button
                  type='button'
                  onClick={() => setShowPassword((current) => !current)}
                  className={cn(
                    'absolute top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isRtl ? 'left-2' : 'right-2',
                  )}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className='size-4' />
                  ) : (
                    <Eye className='size-4' />
                  )}
                </button>
              </div>
            </div>

            {/* LOGIN */}
            <Button
              className='h-12 w-full rounded-xl text-sm font-semibold shadow-sm'
              type='submit'
              disabled={loading}
            >
              {loading && <Loader2 className='size-4 animate-spin' />}

              {loading ? t('loggingIn') : t('login')}
            </Button>
          </div>

          {/* SIGN UP */}
          {/* <div className='mt-8 border-t border-border/60 pt-6 text-center text-sm text-muted-foreground'>
            {t('noAccount')}{' '}
            <Link
              href={`/${locale}/signup`}
              className='font-semibold text-primary underline-offset-4 transition-colors hover:underline'
            >
              {t('signupHere')}
            </Link>
          </div> */}
        </form>
      </CardContent>
    </Card>
  )
}

export default Login
