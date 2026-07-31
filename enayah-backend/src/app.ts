import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express'

import { globalErrorHandler } from './core/errors/error.middleware'
import { requestLogger } from './core/logging/request.logger'
import { getPublicFileStorageRoot } from './core/utils/file-storage.util'
import routes from './routes'
import { AppError } from './core/errors/AppError'

const app = express()

app.set('trust proxy', 1)

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

app.use(cookieParser())

app.use(requestLogger)

/*
 * Public files
 *
 * Keep this before the JSON parser and API routes because
 * serving an image does not need cookie or JSON-body processing.
 */
app.use(
  '/uploads',
  express.static(getPublicFileStorageRoot(), {
    index: false,
    dotfiles: 'deny',
    fallthrough: false,
    maxAge: '1y',
    immutable: true,

    setHeaders: (response) => {
      response.setHeader('X-Content-Type-Options', 'nosniff')

      // response.setHeader(
      //   'Content-Security-Policy',
      //   "default-src 'none'; sandbox",
      // )
      response.setHeader('Cross-Origin-Resource-Policy', 'same-site')
    },
  }),
)

/*
 * Request body parsers
 *
 * The avatar upload uses multipart/form-data and Multer,
 * so express.json() does not process the uploaded image.
 */
app.use(express.json({ limit: '1mb' }))
app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
  }),
)

/*
 * Handle invalid JSON produced by express.json().
 *
 * This must appear directly after the JSON parser.
 */
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    console.error('Invalid JSON:', err.message)
    return res.status(400).json({ message: 'Invalid JSON format' })
  }
  next(err)
})

app.use('/api/v1', routes)

/*
 * No route matched.
 *
 * This is normal middleware, not an error handler.
 */
app.use((request: Request, _response: Response, next: NextFunction): void => {
  next(
    new AppError(
      `Route ${request.method} ${request.originalUrl} was not found.`,
      404,
      'ROUTE_NOT_FOUND',
    ),
  )
})

app.use(globalErrorHandler)

export default app
