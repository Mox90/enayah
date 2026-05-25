'use client'

import React, { useState } from 'react'

import { useRouter } from 'next/navigation'

import { loginRequest } from '@/modules/iam/services/auth.services'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { useAuthStore } from '../../stores/auth.store'
import { usePermissionStore } from '../../stores/permission.store'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { useTranslations } from 'next-intl'

const Login = () => {
  const t = useTranslations('auth')
  const router = useRouter()

  const login = useAuthStore((state) => state.login)
  const setPermissions = usePermissionStore((state) => state.setPermissions)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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

      // ✅ store auth
      login(response.accessToken, response.user)

      // ✅ flatten permissions
      const permissions =
        response.user?.roles?.flatMap(
          (role: any) => role.permissions?.map((perm: any) => perm.code) || [],
        ) || []

      // ✅ store permissions
      setPermissions(permissions)

      // ✅ redirect
      router.push('/dashboard')
    } catch (error) {
      //console.error('Login failed:', error)
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

          <Input
            placeholder={t('password')}
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button className='w-full' type='submit' disabled={loading}>
            {loading ? `${t('loggingIn')}` : `${t('login')}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default Login
