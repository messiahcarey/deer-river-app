// AWS CloudWatch integration for Deer River application
import { Logger } from './logger'

export class CloudWatchMetrics {
  private static instance: CloudWatchMetrics
  private metrics: Array<{
    name: string
    value: number
    unit: string
    timestamp: Date
    dimensions?: Record<string, string>
  }> = []

  static getInstance(): CloudWatchMetrics {
    if (!CloudWatchMetrics.instance) {
      CloudWatchMetrics.instance = new CloudWatchMetrics()
    }
    return CloudWatchMetrics.instance
  }

  // Custom metrics
  addMetric(name: string, value: number, unit: string = 'Count', dimensions?: Record<string, string>) {
    this.metrics.push({
      name,
      value,
      unit,
      timestamp: new Date(),
      dimensions
    })
    
    Logger.info(`Metric recorded: ${name} = ${value} ${unit}`, { dimensions })
  }

  // API performance metrics
  recordApiCall(endpoint: string, method: string, duration: number, statusCode: number) {
    this.addMetric('API.Calls', 1, 'Count', {
      endpoint,
      method,
      status: statusCode.toString()
    })
    
    this.addMetric('API.Duration', duration, 'Milliseconds', {
      endpoint,
      method
    })
  }

  // Database metrics
  recordDatabaseOperation(operation: string, duration: number, success: boolean) {
    this.addMetric('Database.Operations', 1, 'Count', {
      operation,
      success: success.toString()
    })
    
    this.addMetric('Database.Duration', duration, 'Milliseconds', {
      operation
    })
  }

  // CSV import metrics
  recordCsvImport(recordCount: number, successCount: number, errorCount: number, duration: number) {
    this.addMetric('CSV.Imports', 1, 'Count')
    this.addMetric('CSV.RecordsProcessed', recordCount, 'Count')
    this.addMetric('CSV.RecordsSuccess', successCount, 'Count')
    this.addMetric('CSV.RecordsError', errorCount, 'Count')
    this.addMetric('CSV.Duration', duration, 'Milliseconds')
  }

  // Memory metrics
  recordMemoryUsage() {
    const memUsage = process.memoryUsage()
    this.addMetric('Memory.RSS', memUsage.rss, 'Bytes')
    this.addMetric('Memory.HeapUsed', memUsage.heapUsed, 'Bytes')
    this.addMetric('Memory.HeapTotal', memUsage.heapTotal, 'Bytes')
    this.addMetric('Memory.External', memUsage.external, 'Bytes')
  }

  // Get all metrics (for debugging)
  getMetrics() {
    return this.metrics
  }

  // Clear metrics (for memory management)
  clearMetrics() {
    this.metrics = []
  }
}

// Usage examples:
export const metrics = CloudWatchMetrics.getInstance()

// Example usage in API routes:
// metrics.recordApiCall('/api/people', 'GET', 150, 200)
// metrics.recordDatabaseOperation('findMany', 75, true)
// metrics.recordCsvImport(50, 48, 2, 2000)
