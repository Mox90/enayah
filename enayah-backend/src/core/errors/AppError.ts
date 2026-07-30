// export class AppError extends Error {
//   statusCode: number
//   isOperational: boolean

//   constructor(message: string, statusCode = 500) {
//     super(message)

//     this.statusCode = statusCode
//     this.isOperational = true

//     Error.captureStackTrace(this, this.constructor)
//   }
// }

export class AppError extends Error {
  statusCode: number
  isOperational: boolean
  code?: string

  constructor(message: string, statusCode = 500, code?: string) {
    super(message)

    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code || ''
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}
