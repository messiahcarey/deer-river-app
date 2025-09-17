// Enhanced logging utility for Deer River application
export class Logger {
  private static formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const logData = data ? ` | Data: ${JSON.stringify(data)}` : ''
    return `[${timestamp}] [${level}] ${message}${logData}`
  }

  static info(message: string, data?: any): void {
    console.log(this.formatMessage('INFO', message, data))
  }

  static warn(message: string, data?: any): void {
    console.warn(this.formatMessage('WARN', message, data))
  }

  static error(message: string, error?: Error | any, data?: any): void {
    const errorData = error ? {
      message: error.message,
      stack: error.stack,
      ...data
    } : data
    
    console.error(this.formatMessage('ERROR', message, errorData))
  }

  static debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage('DEBUG', message, data))
    }
  }

  static apiRequest(method: string, endpoint: string, data?: any): void {
    this.info(`API ${method} ${endpoint}`, data)
  }

  static apiResponse(method: string, endpoint: string, status: number, data?: any): void {
    const level = status >= 400 ? 'error' : 'info'
    this[level](`API ${method} ${endpoint} - ${status}`, data)
  }
}
