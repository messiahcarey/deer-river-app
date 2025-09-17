// Lightweight monitoring without external service costs
import { Logger } from './logger'

export interface SystemMetrics {
  timestamp: string
  uptime: number
  memoryUsage: NodeJS.MemoryUsage
  responseTime: number
  apiCalls: number
  errors: number
}

export class MonitoringLite {
  private static instance: MonitoringLite
  private metrics: SystemMetrics
  private apiCallCount = 0
  private errorCount = 0

  static getInstance(): MonitoringLite {
    if (!MonitoringLite.instance) {
      MonitoringLite.instance = new MonitoringLite()
    }
    return MonitoringLite.instance
  }

  constructor() {
    this.metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      responseTime: 0,
      apiCalls: 0,
      errors: 0
    }
  }

  // Track API calls (free)
  recordApiCall(endpoint: string, method: string, duration: number, statusCode: number) {
    this.apiCallCount++
    Logger.info(`API ${method} ${endpoint} - ${statusCode} (${duration}ms)`)
    
    // Log to console for debugging (free)
    console.log(`[API] ${method} ${endpoint} | ${statusCode} | ${duration}ms`)
  }

  // Track errors (free)
  recordError(error: Error, context: string) {
    this.errorCount++
    Logger.error(`Error in ${context}`, error)
  }

  // Track CSV imports (free)
  recordCsvImport(recordCount: number, successCount: number, errorCount: number, duration: number) {
    Logger.info(`CSV Import completed`, {
      totalRecords: recordCount,
      successful: successCount,
      errors: errorCount,
      duration: `${duration}ms`
    })
  }

  // Get current metrics (free)
  getMetrics(): SystemMetrics {
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      responseTime: 0, // Will be set by individual requests
      apiCalls: this.apiCallCount,
      errors: this.errorCount
    }
  }

  // Reset counters (free)
  resetCounters() {
    this.apiCallCount = 0
    this.errorCount = 0
  }

  // Health check (free)
  isHealthy(): boolean {
    const memUsage = process.memoryUsage()
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024
    
    // Simple health checks
    return heapUsedMB < 500 && this.errorCount < 10
  }
}

// Free usage
export const monitoring = MonitoringLite.getInstance()
