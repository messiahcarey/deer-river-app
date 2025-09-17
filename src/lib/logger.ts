// Enhanced logging utility for Deer River application
export class Logger {
  private static formatMessage(level: string, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString()
    const logData = data ? ` | Data: ${JSON.stringify(data)}` : ''
    return `[${timestamp}] [${level}] ${message}${logData}`
  }

  static info(message: string, data?: unknown): void {
    console.log(this.formatMessage('INFO', message, data))
  }

  static warn(message: string, data?: unknown): void {
    console.warn(this.formatMessage('WARN', message, data))
  }

  static error(message: string, error?: Error | unknown, data?: unknown): void {
    const errorData = error ? {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...(data as Record<string, unknown>)
    } : data
    
    console.error(this.formatMessage('ERROR', message, errorData))
  }

  static debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage('DEBUG', message, data))
    }
  }

  static apiRequest(method: string, endpoint: string, data?: unknown): void {
    this.info(`API ${method} ${endpoint}`, data)
  }

  static apiResponse(method: string, endpoint: string, status: number, data?: unknown): void {
    const level = status >= 400 ? 'error' : 'info'
    this[level](`API ${method} ${endpoint} - ${status}`, data)
  }
}
