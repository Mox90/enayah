// enayah-frontend/src/modules/iam/component/auth/login-form.tsx

'use client'

import React, { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import axios from 'axios'
import { Eye, EyeOff } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { loginRequest } from '@/modules/iam/services/auth.services'

import { useAuthStore } from '../../stores/auth.store'
import { usePermissionStore } from '../../stores/permission.store'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const Login = () => {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const isRtl = locale === 'ar'

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

      login(response.accessToken, response.user)

      const permissions =
        response.user?.roles?.flatMap(
          (role: any) => role.permissions?.map((perm: any) => perm.code) || [],
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
    <Card className='w-full max-w-md rounded-2xl shadow-lg'>
      <CardContent className='p-6'>
        <form className='space-y-4 p-6' onSubmit={handleLogin}>
          <div className='space-y-1'>
            <h1 className='text-center text-2xl font-bold'>
              {t('loginTitle')}
            </h1>

            <p className='text-sm text-muted-foreground'>
              {t('loginSubtitle')}
            </p>
          </div>

          {error && (
            <div className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400'>
              {error}
            </div>
          )}

          <Input
            placeholder={t('username')}
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <div className='relative'>
            <Input
              placeholder={t('password')}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={isRtl ? 'pl-10' : 'pr-10'}
            />

            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 text-muted-foreground',
                isRtl ? 'left-3' : 'right-3',
              )}
            >
              {showPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>

          <Button className='w-full' type='submit' disabled={loading}>
            {loading ? t('loggingIn') : t('login')}
          </Button>

          <div className='text-center text-sm text-muted-foreground'>
            {t('noAccount')}{' '}
            <Link
              href={`/${locale}/signup`}
              className='font-medium text-primary hover:underline'
            >
              {t('signupHere')}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default Login
