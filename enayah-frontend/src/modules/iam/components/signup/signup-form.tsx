'use client'

import React, { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import axios from 'axios'
import { Eye, EyeOff } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { signupRequest } from '@/modules/iam/services/auth.services'

const Signup = () => {
  const t = useTranslations('auth')

  const locale = useLocale()
  const router = useRouter()

  const [employeeNumber, setEmployeeNumber] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      setLoading(true)

      setError('')

      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }

      await signupRequest({
        employeeNumber,
        email,
        username,
        password,
      })

      router.push(`/${locale}/login`)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Signup failed')
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
        <form className='space-y-4' onSubmit={handleSignup}>
          <div className='space-y-1 text-center'>
            <h1 className='text-2xl font-bold'>{t('signupTitle')}</h1>

            <p className='text-sm text-muted-foreground'>
              {t('signupSubtitle')}
            </p>
          </div>

          {error && (
            <div className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400'>
              {error}
            </div>
          )}

          <Input
            placeholder={t('employeeNumber')}
            value={employeeNumber}
            onChange={(e) => setEmployeeNumber(e.target.value)}
          />

          <Input
            placeholder={t('email')}
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            placeholder={t('username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <div className='relative'>
            <Input
              placeholder={t('password')}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='pr-10'
            />

            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground'
            >
              {showPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>

          <div className='relative'>
            <Input
              placeholder={t('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='pr-10'
            />

            <button
              type='button'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className='absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground'
            >
              {showConfirmPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>

          <Button className='w-full' type='submit' disabled={loading}>
            {loading ? t('creatingAccount') : t('signup')}
          </Button>

          <div className='text-center text-sm text-muted-foreground'>
            {t('alreadyHaveAccount')}{' '}
            <Link
              href={`/${locale}/login`}
              className='font-medium text-primary hover:underline'
            >
              {t('login')}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default Signup
