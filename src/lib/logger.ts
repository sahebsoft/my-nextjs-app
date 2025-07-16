// Production-ready logging utility for AI workflow

import { promises as fs } from 'fs';
import path from 'path';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: any;
  error?: Error;
}

export class Logger {
  private logLevel: LogLevel;
  private logDir: string;
  private logFile: string;
  private sessionId: string;

  constructor(logLevel: LogLevel = LogLevel.INFO, logDir: string = './logs') {
    this.logLevel = logLevel;
    this.logDir = logDir;
    this.sessionId = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFile = path.join(logDir, `ai-workflow-${this.sessionId}.log`);
    this.initializeLogDir();
  }

  private async initializeLogDir(): Promise<void> {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  private async writeLog(entry: LogEntry): Promise<void> {
    const logLine = `${entry.timestamp} [${entry.level}] ${entry.message}`;
    const detailedLog = entry.context || entry.error 
      ? `${logLine}\n${JSON.stringify({ context: entry.context, error: entry.error?.stack }, null, 2)}\n`
      : `${logLine}\n`;

    try {
      await fs.appendFile(this.logFile, detailedLog);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  private formatMessage(level: string, message: string, context?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    };
  }

  debug(message: string, context?: any): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      const entry = this.formatMessage('DEBUG', message, context);
      console.debug(`🔍 ${message}`, context || '');
      this.writeLog(entry);
    }
  }

  info(message: string, context?: any): void {
    if (this.logLevel <= LogLevel.INFO) {
      const entry = this.formatMessage('INFO', message, context);
      console.log(`ℹ️  ${message}`, context || '');
      this.writeLog(entry);
    }
  }

  warn(message: string, context?: any): void {
    if (this.logLevel <= LogLevel.WARN) {
      const entry = this.formatMessage('WARN', message, context);
      console.warn(`⚠️  ${message}`, context || '');
      this.writeLog(entry);
    }
  }

  error(message: string, error?: Error, context?: any): void {
    if (this.logLevel <= LogLevel.ERROR) {
      const entry = this.formatMessage('ERROR', message, context);
      entry.error = error;
      console.error(`❌ ${message}`, error || '', context || '');
      this.writeLog(entry);
    }
  }

  success(message: string, context?: any): void {
    const entry = this.formatMessage('SUCCESS', message, context);
    console.log(`✅ ${message}`, context || '');
    this.writeLog(entry);
  }

  progress(message: string, context?: any): void {
    const entry = this.formatMessage('PROGRESS', message, context);
    console.log(`🚀 ${message}`, context || '');
    this.writeLog(entry);
  }

  async getLogPath(): Promise<string> {
    return this.logFile;
  }

  async generateSummaryReport(): Promise<string> {
    try {
      const logContent = await fs.readFile(this.logFile, 'utf-8');
      const lines = logContent.split('\n').filter(line => line.trim());
      
      const summary = {
        sessionId: this.sessionId,
        totalEntries: lines.length,
        errors: lines.filter(line => line.includes('[ERROR]')).length,
        warnings: lines.filter(line => line.includes('[WARN]')).length,
        successes: lines.filter(line => line.includes('[SUCCESS]')).length,
        startTime: lines[0]?.split(' ')[0] || 'Unknown',
        endTime: lines[lines.length - 1]?.split(' ')[0] || 'Unknown'
      };

      const reportPath = path.join(this.logDir, `summary-${this.sessionId}.json`);
      await fs.writeFile(reportPath, JSON.stringify(summary, null, 2));
      
      return reportPath;
    } catch (error) {
      console.error('Failed to generate summary report:', error);
      throw error;
    }
  }
}

// Global logger instance
export const logger = new Logger(LogLevel.INFO);