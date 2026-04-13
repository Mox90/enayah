import express from 'express'
import routes from './routes'
import { globalErrorHandler } from './core/errors/error.middleware'
import { requestLogger } from './core/logging/request.logger'
//import { requestLogger } from './core/logging/'

const app = express()

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
