/**
 * AI Test Results Logger
 * 
 * This module captures all AI testing data and saves it to structured reports
 * that can be analyzed for continuous improvement of the AI testing system.
 */

import { promises as fs } from 'fs'
import path from 'path'

export interface AITestReport {
  metadata: {
    testRunId: string
    timestamp: string
    duration: number
    environment: {
      nodeVersion: string
      puppeteerVersion: string
      nextjsUrl: string
      userAgent: string
    }
  }
  phases: {
    discovery: AIDiscoveryReport
    generation: AIGenerationReport
    execution: AIExecutionReport
    analysis: AIAnalysisReport
    adaptation: AIAdaptationReport
    reporting: AIFinalReport
  }
  summary: {
    overallStatus: 'SUCCESS' | 'PARTIAL' | 'FAILED'
    confidence: number
    testsGenerated: number
    testsExecuted: number
    testsPassed: number
    testsFailed: number
    issuesFound: number
    fixesGenerated: number
    screenshotsCaptured: number
  }
  performance: {
    totalDuration: number
    phaseTimings: Record<string, number>
    memoryUsage: any
    cpuUsage: any
  }
  insights: {
    strengths: string[]
    weaknesses: string[]
    improvements: string[]
    recommendations: string[]
  }
}

export interface AIDiscoveryReport {
  phase: 'discovery'
  status: 'success' | 'failed'
  duration: number
  applicationData: {
    title: string
    url: string
    structure: any
    interactiveElements: any
    content: any
    technical: any
  }
  screenshots: string[]
  findings: string[]
  issues: string[]
}

export interface AIGenerationReport {
  phase: 'generation'
  status: 'success' | 'failed'
  duration: number
  claudeAnalysis: {
    confidence: number
    uiElements: any[]
    userFlows: any[]
    testCases: any[]
    issues: any[]
    fixes: any[]
  }
  generatedTests: {
    count: number
    types: string[]
    code: string[]
    priorities: string[]
  }
  qualityMetrics: {
    codeQuality: number
    coverage: number
    complexity: number
  }
}

export interface AIExecutionReport {
  phase: 'execution'
  status: 'success' | 'failed'
  duration: number
  testResults: {
    total: number
    passed: number
    failed: number
    skipped: number
    details: any[]
  }
  performance: {
    averageDuration: number
    slowestTest: any
    fastestTest: any
  }
  screenshots: string[]
  errors: any[]
}

export interface AIAnalysisReport {
  phase: 'analysis'
  status: 'success' | 'failed'
  duration: number
  claudeVerification: {
    overallStatus: string
    confidence: number
    issuesFound: any[]
    recommendations: any[]
    fixesNeeded: any[]
  }
  patterns: {
    commonFailures: string[]
    successPatterns: string[]
    performanceBottlenecks: string[]
  }
}

export interface AIAdaptationReport {
  phase: 'adaptation'
  status: 'success' | 'failed'
  duration: number
  additionalTests: {
    count: number
    types: string[]
    reasons: string[]
  }
  improvements: {
    codeChanges: any[]
    testEnhancements: any[]
    systemOptimizations: any[]
  }
}

export interface AIFinalReport {
  phase: 'reporting'
  status: 'success' | 'failed'
  duration: number
  summary: any
  insights: any
  nextActions: string[]
}

export class AITestLogger {
  private testRunId: string
  private startTime: number
  private reportsDir: string
  private currentReport: Partial<AITestReport>

  constructor() {
    this.testRunId = `ai-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.startTime = Date.now()
    this.reportsDir = path.join(process.cwd(), 'e2e', 'reports')
    this.currentReport = {
      metadata: {
        testRunId: this.testRunId,
        timestamp: new Date().toISOString(),
        duration: 0,
        environment: {
          nodeVersion: process.version,
          puppeteerVersion: 'latest',
          nextjsUrl: 'http://localhost:3000',
          userAgent: 'AI-Testing-System'
        }
      },
      phases: {} as any,
      summary: {} as any,
      performance: {} as any,
      insights: {} as any
    }

    console.log(`📊 AI Test Logger initialized: ${this.testRunId}`)
  }

  /**
   * Initialize the reports directory
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.reportsDir, { recursive: true })
      console.log(`📁 Reports directory ready: ${this.reportsDir}`)
    } catch (error) {
      console.error('❌ Failed to create reports directory:', error)
    }
  }

  /**
   * Log discovery phase results
   */
  async logDiscoveryPhase(data: Partial<AIDiscoveryReport>): Promise<void> {
    console.log('📝 Logging Discovery Phase...')
    
    this.currentReport.phases!.discovery = {
      phase: 'discovery',
      status: data.status || 'success',
      duration: data.duration || 0,
      applicationData: data.applicationData || {},
      screenshots: data.screenshots || [],
      findings: data.findings || [],
      issues: data.issues || []
    }

    await this.savePhaseReport('discovery', this.currentReport.phases!.discovery)
    console.log(`✅ Discovery phase logged (${data.findings?.length || 0} findings)`)
  }

  /**
   * Log generation phase results
   */
  async logGenerationPhase(data: Partial<AIGenerationReport>): Promise<void> {
    console.log('📝 Logging Generation Phase...')
    
    this.currentReport.phases!.generation = {
      phase: 'generation',
      status: data.status || 'success',
      duration: data.duration || 0,
      claudeAnalysis: data.claudeAnalysis || {},
      generatedTests: data.generatedTests || { count: 0, types: [], code: [], priorities: [] },
      qualityMetrics: data.qualityMetrics || { codeQuality: 0, coverage: 0, complexity: 0 }
    }

    await this.savePhaseReport('generation', this.currentReport.phases!.generation)
    console.log(`✅ Generation phase logged (${data.generatedTests?.count || 0} tests generated)`)
  }

  /**
   * Log execution phase results
   */
  async logExecutionPhase(data: Partial<AIExecutionReport>): Promise<void> {
    console.log('📝 Logging Execution Phase...')
    
    this.currentReport.phases!.execution = {
      phase: 'execution',
      status: data.status || 'success',
      duration: data.duration || 0,
      testResults: data.testResults || { total: 0, passed: 0, failed: 0, skipped: 0, details: [] },
      performance: data.performance || { averageDuration: 0, slowestTest: null, fastestTest: null },
      screenshots: data.screenshots || [],
      errors: data.errors || []
    }

    await this.savePhaseReport('execution', this.currentReport.phases!.execution)
    console.log(`✅ Execution phase logged (${data.testResults?.passed || 0}/${data.testResults?.total || 0} passed)`)
  }

  /**
   * Log analysis phase results
   */
  async logAnalysisPhase(data: Partial<AIAnalysisReport>): Promise<void> {
    console.log('📝 Logging Analysis Phase...')
    
    this.currentReport.phases!.analysis = {
      phase: 'analysis',
      status: data.status || 'success',
      duration: data.duration || 0,
      claudeVerification: data.claudeVerification || {},
      patterns: data.patterns || { commonFailures: [], successPatterns: [], performanceBottlenecks: [] }
    }

    await this.savePhaseReport('analysis', this.currentReport.phases!.analysis)
    console.log(`✅ Analysis phase logged (${data.claudeVerification?.issuesFound?.length || 0} issues found)`)
  }

  /**
   * Log adaptation phase results
   */
  async logAdaptationPhase(data: Partial<AIAdaptationReport>): Promise<void> {
    console.log('📝 Logging Adaptation Phase...')
    
    this.currentReport.phases!.adaptation = {
      phase: 'adaptation',
      status: data.status || 'success',
      duration: data.duration || 0,
      additionalTests: data.additionalTests || { count: 0, types: [], reasons: [] },
      improvements: data.improvements || { codeChanges: [], testEnhancements: [], systemOptimizations: [] }
    }

    await this.savePhaseReport('adaptation', this.currentReport.phases!.adaptation)
    console.log(`✅ Adaptation phase logged (${data.additionalTests?.count || 0} additional tests)`)
  }

  /**
   * Log final reporting phase
   */
  async logReportingPhase(data: Partial<AIFinalReport>): Promise<void> {
    console.log('📝 Logging Reporting Phase...')
    
    this.currentReport.phases!.reporting = {
      phase: 'reporting',
      status: data.status || 'success',
      duration: data.duration || 0,
      summary: data.summary || {},
      insights: data.insights || {},
      nextActions: data.nextActions || []
    }

    await this.savePhaseReport('reporting', this.currentReport.phases!.reporting)
    console.log(`✅ Reporting phase logged`)
  }

  /**
   * Generate and save final comprehensive report
   */
  async generateFinalReport(): Promise<string> {
    console.log('🎯 Generating final AI test report...')
    
    const endTime = Date.now()
    const totalDuration = endTime - this.startTime

    // Calculate summary statistics
    const phases = this.currentReport.phases!
    const generation = phases.generation
    const execution = phases.execution
    const analysis = phases.analysis

    this.currentReport.summary = {
      overallStatus: this.calculateOverallStatus(),
      confidence: generation?.claudeAnalysis?.confidence || 0,
      testsGenerated: generation?.generatedTests?.count || 0,
      testsExecuted: execution?.testResults?.total || 0,
      testsPassed: execution?.testResults?.passed || 0,
      testsFailed: execution?.testResults?.failed || 0,
      issuesFound: analysis?.claudeVerification?.issuesFound?.length || 0,
      fixesGenerated: analysis?.claudeVerification?.fixesNeeded?.length || 0,
      screenshotsCaptured: (phases.discovery?.screenshots?.length || 0) + (execution?.screenshots?.length || 0)
    }

    this.currentReport.performance = {
      totalDuration,
      phaseTimings: {
        discovery: phases.discovery?.duration || 0,
        generation: phases.generation?.duration || 0,
        execution: phases.execution?.duration || 0,
        analysis: phases.analysis?.duration || 0,
        adaptation: phases.adaptation?.duration || 0,
        reporting: phases.reporting?.duration || 0
      },
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    }

    this.currentReport.insights = this.generateInsights()
    this.currentReport.metadata!.duration = totalDuration

    // Save final report
    const reportPath = await this.saveFinalReport()
    
    // Generate summary for console
    this.printSummary()
    
    console.log(`📊 Final AI test report saved: ${reportPath}`)
    return reportPath
  }

  /**
   * Save individual phase report
   */
  private async savePhaseReport(phase: string, data: any): Promise<void> {
    try {
      const filename = `${this.testRunId}-phase-${phase}.json`
      const filepath = path.join(this.reportsDir, filename)
      await fs.writeFile(filepath, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error(`❌ Failed to save ${phase} phase report:`, error)
    }
  }

  /**
   * Save final comprehensive report
   */
  private async saveFinalReport(): Promise<string> {
    try {
      const filename = `${this.testRunId}-final-report.json`
      const filepath = path.join(this.reportsDir, filename)
      await fs.writeFile(filepath, JSON.stringify(this.currentReport, null, 2))
      
      // Also save a human-readable summary
      const summaryPath = path.join(this.reportsDir, `${this.testRunId}-summary.md`)
      await this.generateMarkdownSummary(summaryPath)
      
      return filepath
    } catch (error) {
      console.error('❌ Failed to save final report:', error)
      throw error
    }
  }

  /**
   * Generate markdown summary report
   */
  private async generateMarkdownSummary(filepath: string): Promise<void> {
    const summary = this.currentReport.summary!
    const performance = this.currentReport.performance!
    const insights = this.currentReport.insights!

    const markdown = `# AI Test Report Summary

## Test Run Information
- **Test Run ID**: ${this.testRunId}
- **Timestamp**: ${this.currentReport.metadata!.timestamp}
- **Duration**: ${Math.round(performance.totalDuration / 1000)}s
- **Overall Status**: ${summary.overallStatus}

## Test Results Overview
- **AI Confidence**: ${(summary.confidence * 100).toFixed(1)}%
- **Tests Generated**: ${summary.testsGenerated}
- **Tests Executed**: ${summary.testsExecuted}
- **Tests Passed**: ${summary.testsPassed}
- **Tests Failed**: ${summary.testsFailed}
- **Success Rate**: ${summary.testsExecuted > 0 ? ((summary.testsPassed / summary.testsExecuted) * 100).toFixed(1) : 0}%

## Analysis Results
- **Issues Found**: ${summary.issuesFound}
- **Fixes Generated**: ${summary.fixesGenerated}
- **Screenshots Captured**: ${summary.screenshotsCaptured}

## Performance Metrics
- **Total Duration**: ${Math.round(performance.totalDuration / 1000)}s
- **Discovery Phase**: ${Math.round(performance.phaseTimings.discovery / 1000)}s
- **Generation Phase**: ${Math.round(performance.phaseTimings.generation / 1000)}s
- **Execution Phase**: ${Math.round(performance.phaseTimings.execution / 1000)}s
- **Analysis Phase**: ${Math.round(performance.phaseTimings.analysis / 1000)}s

## AI Insights

### Strengths
${insights.strengths?.map(s => `- ${s}`).join('\n') || '- None identified'}

### Areas for Improvement
${insights.weaknesses?.map(w => `- ${w}`).join('\n') || '- None identified'}

### Recommendations
${insights.recommendations?.map(r => `- ${r}`).join('\n') || '- None provided'}

## Technical Details
- **Node.js Version**: ${this.currentReport.metadata!.environment.nodeVersion}
- **Memory Usage**: ${Math.round(performance.memoryUsage.heapUsed / 1024 / 1024)}MB
- **Test Environment**: ${this.currentReport.metadata!.environment.nextjsUrl}

---
*Generated by AI Testing System at ${new Date().toISOString()}*
`

    await fs.writeFile(filepath, markdown)
  }

  /**
   * Calculate overall test status
   */
  private calculateOverallStatus(): 'SUCCESS' | 'PARTIAL' | 'FAILED' {
    const phases = this.currentReport.phases!
    const failedPhases = Object.values(phases).filter(phase => phase?.status === 'failed').length
    
    if (failedPhases === 0) return 'SUCCESS'
    if (failedPhases < Object.keys(phases).length) return 'PARTIAL'
    return 'FAILED'
  }

  /**
   * Generate insights based on test results
   */
  private generateInsights(): any {
    const summary = this.currentReport.summary!
    const execution = this.currentReport.phases!.execution
    
    const insights = {
      strengths: [],
      weaknesses: [],
      improvements: [],
      recommendations: []
    }

    // Analyze strengths
    if (summary.confidence > 0.8) {
      insights.strengths.push('High AI confidence in test generation')
    }
    if (summary.testsPassed / summary.testsExecuted > 0.8) {
      insights.strengths.push('High test success rate indicates stable application')
    }
    if (execution?.screenshots?.length > 5) {
      insights.strengths.push('Comprehensive visual documentation captured')
    }

    // Analyze weaknesses
    if (summary.confidence < 0.6) {
      insights.weaknesses.push('Low AI confidence suggests complex or unclear UI patterns')
    }
    if (summary.testsFailed > summary.testsPassed) {
      insights.weaknesses.push('More tests failed than passed - application may need fixes')
    }
    if (summary.issuesFound > 5) {
      insights.weaknesses.push('High number of issues found - quality improvements needed')
    }

    // Generate recommendations
    if (summary.testsGenerated < 5) {
      insights.recommendations.push('Consider adding more interactive elements for better test coverage')
    }
    if (summary.fixesGenerated > 0) {
      insights.recommendations.push('Review and implement AI-generated fixes')
    }
    insights.recommendations.push('Run tests regularly to maintain quality')
    insights.recommendations.push('Review failed tests for improvement opportunities')

    return insights
  }

  /**
   * Print console summary
   */
  private printSummary(): void {
    const summary = this.currentReport.summary!
    const performance = this.currentReport.performance!

    console.log('\n' + '='.repeat(60))
    console.log('🤖 AI TEST SYSTEM - FINAL REPORT')
    console.log('='.repeat(60))
    console.log(`📊 Test Run ID: ${this.testRunId}`)
    console.log(`⏰ Duration: ${Math.round(performance.totalDuration / 1000)}s`)
    console.log(`🎯 Overall Status: ${summary.overallStatus}`)
    console.log(`🧠 AI Confidence: ${(summary.confidence * 100).toFixed(1)}%`)
    console.log('─'.repeat(60))
    console.log(`🧪 Tests Generated: ${summary.testsGenerated}`)
    console.log(`⚡ Tests Executed: ${summary.testsExecuted}`)
    console.log(`✅ Tests Passed: ${summary.testsPassed}`)
    console.log(`❌ Tests Failed: ${summary.testsFailed}`)
    console.log(`📈 Success Rate: ${summary.testsExecuted > 0 ? ((summary.testsPassed / summary.testsExecuted) * 100).toFixed(1) : 0}%`)
    console.log('─'.repeat(60))
    console.log(`🐛 Issues Found: ${summary.issuesFound}`)
    console.log(`🔧 Fixes Generated: ${summary.fixesGenerated}`)
    console.log(`📸 Screenshots: ${summary.screenshotsCaptured}`)
    console.log('='.repeat(60))
    console.log(`📁 Reports saved to: ${this.reportsDir}`)
    console.log('='.repeat(60) + '\n')
  }

  /**
   * Get test run ID for external reference
   */
  getTestRunId(): string {
    return this.testRunId
  }

  /**
   * Get current report data
   */
  getCurrentReport(): Partial<AITestReport> {
    return this.currentReport
  }
}

// Export singleton instance
export const aiTestLogger = new AITestLogger()
