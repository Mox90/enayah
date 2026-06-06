import express from 'express'
import cors from 'cors'

import routes from './routes'
import { globalErrorHandler } from './core/errors/error.middleware'
import { requestLogger } from './core/logging/request.logger'
import cookieParser from 'cookie-parser'
//import { requestLogger } from './core/logging/'

const app = express()

app.use(cookieParser())

const allowedOrigins =
  process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? []

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (Postman, mobile apps, server-to-server)
      if (!origin) {
        return callback(null, true)
      }

      if (process.env.NODE_ENV === 'development') {
        return callback(null, true)
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    },

    credentials: true,
  }),
)

app.use(express.json({ limit: '1mb' }))

app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof SyntaxError && 'body' in err) {
    console.error('Invalid JSON:', err.message)
    return res.status(400).json({ message: 'Invalid JSON format' })
  }
  next(err)
})
//app.use(requestLogger)

app.use('/api/v1', routes)

app.use(globalErrorHandler)

export default app
