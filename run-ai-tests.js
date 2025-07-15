#!/usr/bin/env node

/**
 * AI Test Runner with Comprehensive Reporting
 * 
 * This script runs the AI testing workflow and generates detailed reports
 * that can be analyzed to improve the AI testing system.
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class AITestRunner {
  constructor() {
    this.reportsDir = path.join(process.cwd(), 'e2e', 'reports');
    this.outputDir = path.join(process.cwd(), 'ai-test-results');
    this.startTime = Date.now();
  }

  async run() {
    console.log('🤖 AI Test Runner Starting...');
    console.log('='.repeat(60));
    
    try {
      // Ensure output directories exist
      await this.setupDirectories();
      
      // Run the AI workflow tests
      console.log('🚀 Starting AI Workflow Tests...');
      const testResults = await this.runAITests();
      
      // Process and analyze results
      console.log('📊 Processing Test Results...');
      const analysis = await this.analyzeResults();
      
      // Generate comprehensive report
      console.log('📋 Generating Comprehensive Report...');
      const reportPath = await this.generateComprehensiveReport(analysis);
      
      // Display summary
      this.displaySummary(analysis, reportPath);
      
    } catch (error) {
      console.error('❌ AI Test Runner failed:', error);
      process.exit(1);
    }
  }

  async setupDirectories() {
    try {
      await fs.mkdir(this.reportsDir, { recursive: true });
      await fs.mkdir(this.outputDir, { recursive: true });
      console.log('📁 Directories prepared');
    } catch (error) {
      throw new Error(`Failed to setup directories: ${error.message}`);
    }
  }

  async runAITests() {
    return new Promise((resolve, reject) => {
      const testProcess = spawn('npm', ['run', 'test:ai:workflow'], {
        stdio: 'pipe',
        shell: process.platform === 'win32'
      });

      let stdout = '';
      let stderr = '';

      testProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        process.stdout.write(output); // Real-time output
      });

      testProcess.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        process.stderr.write(output); // Real-time error output
      });

      testProcess.on('close', (code) => {
        resolve({ stdout, stderr, exitCode: code }); // Always resolve to capture partial results
      });

      testProcess.on('error', (error) => {
        reject(new Error(`Failed to start test process: ${error.message}`));
      });
    });
  }

  async analyzeResults() {
    try {
      // Read all report files
      const reportFiles = await fs.readdir(this.reportsDir);
      const jsonReports = reportFiles.filter(file => file.endsWith('.json'));
      
      let allReports = [];
      let latestFinalReport = null;
      
      for (const reportFile of jsonReports) {
        const reportPath = path.join(this.reportsDir, reportFile);
        const reportContent = await fs.readFile(reportPath, 'utf8');
        const report = JSON.parse(reportContent);
        
        allReports.push({ filename: reportFile, data: report });
        
        // Find the latest final report
        if (reportFile.includes('final-report')) {
          if (!latestFinalReport || reportFile > latestFinalReport.filename) {
            latestFinalReport = { filename: reportFile, data: report };
          }
        }
      }
      
      return {
        allReports,
        latestFinalReport,
        reportCount: jsonReports.length,
        analysisTimestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.warn('⚠️ Could not analyze some reports:', error.message);
      return {
        allReports: [],
        latestFinalReport: null,
        reportCount: 0,
        analysisTimestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  async generateComprehensiveReport(analysis) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.outputDir, `ai-test-comprehensive-${timestamp}.json`);
    const markdownPath = path.join(this.outputDir, `ai-test-summary-${timestamp}.md`);
    
    const comprehensiveReport = {
      metadata: {
        generatedAt: new Date().toISOString(),
        testRunDuration: Date.now() - this.startTime,
        nodeVersion: process.version,
        platform: process.platform
      },
      analysis,
      recommendations: this.generateRecommendations(analysis),
      nextSteps: this.generateNextSteps(analysis)
    };
    
    // Save JSON report
    await fs.writeFile(reportPath, JSON.stringify(comprehensiveReport, null, 2));
    
    // Generate markdown summary
    await this.generateMarkdownSummary(markdownPath, comprehensiveReport);
    
    return { jsonPath: reportPath, markdownPath };
  }

  generateRecommendations(analysis) {
    const recommendations = [];
    
    if (!analysis.latestFinalReport) {
      recommendations.push({
        priority: 'high',
        category: 'setup',
        message: 'No final report generated - check test execution'
      });
      return recommendations;
    }
    
    const report = analysis.latestFinalReport.data;
    const summary = report.summary || {};
    
    // Confidence-based recommendations
    if (summary.confidence < 0.7) {
      recommendations.push({
        priority: 'medium',
        category: 'ai-improvement',
        message: 'AI confidence is low - consider improving prompts or providing more context'
      });
    }
    
    // Test coverage recommendations
    if (summary.testsGenerated < 5) {
      recommendations.push({
        priority: 'medium',
        category: 'coverage',
        message: 'Low test generation - consider adding more interactive elements'
      });
    }
    
    // Success rate recommendations
    const successRate = summary.testsExecuted > 0 ? (summary.testsPassed / summary.testsExecuted) : 0;
    if (successRate < 0.8) {
      recommendations.push({
        priority: 'high',
        category: 'quality',
        message: 'Test success rate is low - review and fix failing tests'
      });
    }
    
    // Issue-based recommendations
    if (summary.issuesFound > 0) {
      recommendations.push({
        priority: 'high',
        category: 'fixes',
        message: `${summary.issuesFound} issues found - review AI-generated fixes`
      });
    }
    
    return recommendations;
  }

  generateNextSteps(analysis) {
    const nextSteps = [
      'Review the comprehensive test report for detailed insights',
      'Analyze AI-generated test cases for quality and coverage',
      'Implement any fixes suggested by the AI analysis'
    ];
    
    if (analysis.latestFinalReport) {
      const summary = analysis.latestFinalReport.data.summary || {};
      
      if (summary.testsFailed > 0) {
        nextSteps.push('Investigate and fix failing tests');
      }
      
      if (summary.fixesGenerated > 0) {
        nextSteps.push('Review and apply AI-generated code fixes');
      }
    }
    
    nextSteps.push('Schedule regular AI testing runs for continuous quality monitoring');
    
    return nextSteps;
  }

  async generateMarkdownSummary(markdownPath, report) {
    const analysis = report.analysis;
    const latestReport = analysis.latestFinalReport?.data;
    
    const markdown = `# AI Testing System - Comprehensive Report

## Executive Summary

Generated: ${report.metadata.generatedAt}  
Duration: ${Math.round(report.metadata.testRunDuration / 1000)}s  
Reports Analyzed: ${analysis.reportCount}

${latestReport ? `
## Test Results Overview

- **AI Confidence**: ${((latestReport.summary?.confidence || 0) * 100).toFixed(1)}%
- **Tests Generated**: ${latestReport.summary?.testsGenerated || 0}
- **Tests Executed**: ${latestReport.summary?.testsExecuted || 0}
- **Tests Passed**: ${latestReport.summary?.testsPassed || 0}
- **Tests Failed**: ${latestReport.summary?.testsFailed || 0}
- **Success Rate**: ${latestReport.summary?.testsExecuted > 0 ? ((latestReport.summary.testsPassed / latestReport.summary.testsExecuted) * 100).toFixed(1) : 0}%
- **Issues Found**: ${latestReport.summary?.issuesFound || 0}
- **Fixes Generated**: ${latestReport.summary?.fixesGenerated || 0}

## Performance Metrics

- **Total Duration**: ${Math.round((latestReport.performance?.totalDuration || 0) / 1000)}s
- **Memory Usage**: ${Math.round((latestReport.performance?.memoryUsage?.heapUsed || 0) / 1024 / 1024)}MB
- **Screenshots Captured**: ${latestReport.summary?.screenshotsCaptured || 0}
` : '\n## No Test Results Available\n\nNo final report was generated. Check test execution logs for issues.\n'}

## Recommendations

${report.recommendations.map(rec => `- **${rec.priority.toUpperCase()}** (${rec.category}): ${rec.message}`).join('\n')}

## Next Steps

${report.nextSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

## Technical Details

- **Node.js**: ${report.metadata.nodeVersion}
- **Platform**: ${report.metadata.platform}
- **Generated At**: ${report.metadata.generatedAt}

---
*This report was automatically generated by the AI Testing System*
`;
    
    await fs.writeFile(markdownPath, markdown);
  }

  displaySummary(analysis, reportPaths) {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 AI TESTING SYSTEM - COMPREHENSIVE RESULTS');
    console.log('='.repeat(60));
    
    if (analysis.latestFinalReport) {
      const summary = analysis.latestFinalReport.data.summary || {};
      console.log(`📊 Test Run: ${analysis.latestFinalReport.filename}`);
      console.log(`🧠 AI Confidence: ${((summary.confidence || 0) * 100).toFixed(1)}%`);
      console.log(`🧪 Tests: ${summary.testsPassed || 0}/${summary.testsExecuted || 0} passed`);
      console.log(`🐛 Issues Found: ${summary.issuesFound || 0}`);
      console.log(`🔧 Fixes Generated: ${summary.fixesGenerated || 0}`);
    } else {
      console.log('⚠️ No final test report available');
    }
    
    console.log('─'.repeat(60));
    console.log(`📁 Reports Generated:`);
    console.log(`   JSON: ${reportPaths.jsonPath}`);
    console.log(`   Markdown: ${reportPaths.markdownPath}`);
    console.log(`📋 Total Reports: ${analysis.reportCount}`);
    console.log('='.repeat(60));
    
    console.log('\n✨ AI Testing Complete! Review the reports for detailed insights.');
    console.log('\n📋 To access reports:');
    console.log(`   1. Open: ${reportPaths.markdownPath}`);
    console.log(`   2. JSON data: ${reportPaths.jsonPath}`);
    console.log(`   3. Individual reports: ${this.reportsDir}`);
  }
}

// Run the AI test runner if this script is executed directly
if (require.main === module) {
  const runner = new AITestRunner();
  runner.run().catch(error => {
    console.error('❌ AI Test Runner failed:', error);
    process.exit(1);
  });
}

module.exports = AITestRunner;
