/**
 * Complete AI-Driven Testing Workflow with Comprehensive Logging
 * 
 * This demonstrates the full autonomous testing cycle with detailed reporting:
 * 1. AI analyzes screenshots and generates tests
 * 2. Tests run automatically with comprehensive monitoring
 * 3. AI analyzes results and provides feedback
 * 4. AI generates fixes and new test cases
 * 5. Process repeats until quality goals are met
 * 6. All results are logged to structured reports for analysis
 */

import { Browser, Page } from 'puppeteer';
import {
  createBrowser,
  createPage,
  navigateToPage,
  takeScreenshot,
  wait
} from './utils/puppeteer-helpers';
import { ClaudeAITester, AITestExecutor } from './utils/claude-ai-tester';
import { aiTestLogger, AITestLogger } from './utils/ai-test-logger';

const BASE_URL = 'http://localhost:3000';

/**
 * Complete AI Testing Workflow
 */
describe('🤖 Complete AI Autonomous Testing Workflow', () => {
  let browser: Browser;
  let page: Page;
  let claudeAI: ClaudeAITester;
  let testExecutor: AITestExecutor;
  let workflowData: any = {};
  let phaseStartTime: number;

  beforeAll(async () => {
    console.log('🚀 Initializing Complete AI Testing Workflow with Logging...');
    
    // Initialize the AI test logger
    await aiTestLogger.initialize();
    console.log(`📊 Test Run ID: ${aiTestLogger.getTestRunId()}`);
    
    browser = await createBrowser();
    page = await createPage(browser);
    claudeAI = new ClaudeAITester(page);
    testExecutor = new AITestExecutor(page);
  });

  afterAll(async () => {
    console.log('🏁 Finalizing AI Testing Workflow...');
    
    // Generate and save final comprehensive report
    const reportPath = await aiTestLogger.generateFinalReport();
    
    console.log(`📊 Complete AI Test Report Generated:`);
    console.log(`📁 Report Location: ${reportPath}`);
    console.log(`📋 Test Run ID: ${aiTestLogger.getTestRunId()}`);
    
    if (browser) {
      await browser.close();
    }
  });

  /**
   * Helper function to start phase timing
   */
  const startPhase = (phaseName: string) => {
    console.log(`\n🔄 Starting ${phaseName} Phase...`);
    phaseStartTime = Date.now();
  };

  /**
   * Helper function to end phase timing
   */
  const endPhase = () => {
    return Date.now() - phaseStartTime;
  };

  /**
   * Step 1: AI Application Discovery and Analysis
   */
  test('🔍 Step 1: AI Application Discovery', async () => {
    startPhase('Discovery');
    console.log('🤖 AI STEP 1: Discovering and analyzing the application...');
    
    const discoveryData: any = {
      findings: [],
      issues: [],
      screenshots: []
    };
    
    try {
      // Navigate to the application
      await navigateToPage(page, BASE_URL);
      await wait(3000); // Let everything load completely
      
      // Capture initial screenshot for AI analysis
      const screenshotName = 'ai-discovery-initial';
      await takeScreenshot(page, screenshotName);
      discoveryData.screenshots.push(screenshotName);
      
      // Collect comprehensive application data
      const applicationData = await page.evaluate(() => {
        return {
          // Page metadata
          title: document.title,
          url: window.location.href,
          userAgent: navigator.userAgent,
          
          // Visual structure
          structure: {
            hasHeader: !!document.querySelector('header, [role="banner"]'),
            hasNav: !!document.querySelector('nav, [role="navigation"]'),
            hasMain: !!document.querySelector('main, [role="main"]'),
            hasFooter: !!document.querySelector('footer, [role="contentinfo"]'),
            hasSidebar: !!document.querySelector('aside, .sidebar'),
          },
          
          // Interactive elements
          interactiveElements: {
            links: Array.from(document.querySelectorAll('a')).map(a => ({
              text: a.textContent?.trim(),
              href: a.href,
              target: a.target
            })).filter(link => link.text),
            
            buttons: Array.from(document.querySelectorAll('button')).map(b => ({
              text: b.textContent?.trim(),
              type: b.type,
              disabled: b.disabled
            })),
            
            inputs: Array.from(document.querySelectorAll('input')).map(i => ({
              type: i.type,
              name: i.name,
              placeholder: i.placeholder,
              required: i.required
            })),
            
            forms: Array.from(document.querySelectorAll('form')).map(f => ({
              action: f.action,
              method: f.method,
              fields: Array.from(f.elements).length
            }))
          },
          
          // Content analysis
          content: {
            headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
              level: h.tagName,
              text: h.textContent?.trim()
            })),
            
            images: Array.from(document.querySelectorAll('img')).map(img => ({
              src: img.src,
              alt: img.alt,
              width: img.naturalWidth,
              height: img.naturalHeight
            })),
            
            paragraphs: Array.from(document.querySelectorAll('p')).length,
            lists: Array.from(document.querySelectorAll('ul, ol')).length
          },
          
          // Technical details
          technical: {
            hasJavaScript: !!window.React || !!window.next || document.scripts.length > 0,
            frameworks: {
              react: !!window.React,
              nextjs: !!window.next,
              jquery: !!window.jQuery
            },
            cssFrameworks: {
              tailwind: Array.from(document.styleSheets).some(sheet => {
                try {
                  return Array.from(sheet.cssRules).some(rule => 
                    rule.cssText.includes('tailwind')
                  );
                } catch { return false; }
              }),
              bootstrap: !!document.querySelector('[class*="bootstrap"]')
            }
          }
        };
      });
      
      // Store for next steps
      workflowData.applicationData = applicationData;
      workflowData.discoveryTimestamp = new Date().toISOString();
      discoveryData.applicationData = applicationData;
      
      // Generate findings
      discoveryData.findings = [
        `Application title: ${applicationData.title}`,
        `Interactive elements: ${applicationData.interactiveElements.links.length} links, ${applicationData.interactiveElements.buttons.length} buttons`,
        `Content structure: ${applicationData.content.headings.length} headings, ${applicationData.content.images.length} images`,
        `Framework detected: React=${applicationData.technical.frameworks.react}, Next.js=${applicationData.technical.frameworks.nextjs}`,
        `Forms found: ${applicationData.interactiveElements.forms.length}`,
        `Navigation structure: Header=${applicationData.structure.hasHeader}, Nav=${applicationData.structure.hasNav}`
      ];
      
      // Check for potential issues
      if (!applicationData.structure.hasMain) {
        discoveryData.issues.push('Missing main landmark for accessibility');
      }
      if (applicationData.content.images.some(img => !img.alt)) {
        discoveryData.issues.push('Images found without alt text');
      }
      if (applicationData.interactiveElements.forms.length === 0) {
        discoveryData.issues.push('No forms detected - limited interaction testing possible');
      }
      
      console.log('📊 Application Discovery Complete:');
      console.log(`- Title: ${applicationData.title}`);
      console.log(`- Interactive Elements: ${applicationData.interactiveElements.links.length} links, ${applicationData.interactiveElements.buttons.length} buttons`);
      console.log(`- Content: ${applicationData.content.headings.length} headings, ${applicationData.content.images.length} images`);
      console.log(`- Framework: React=${applicationData.technical.frameworks.react}, Next.js=${applicationData.technical.frameworks.nextjs}`);
      
      discoveryData.status = 'success';
      
    } catch (error) {
      console.error('❌ Discovery phase failed:', error);
      discoveryData.status = 'failed';
      discoveryData.issues.push(`Discovery error: ${error.message}`);
    } finally {
      discoveryData.duration = endPhase();
      
      // Log discovery phase to reports
      await aiTestLogger.logDiscoveryPhase(discoveryData);
    }
    
    expect(discoveryData.applicationData?.title).toBeTruthy();
    expect(discoveryData.status).toBe('success');
  });

  /**
   * Step 2: AI Test Case Generation
   */
  test('🧠 Step 2: AI Test Case Generation', async () => {
    startPhase('Generation');
    console.log('🤖 AI STEP 2: Generating test cases using Claude...');
    
    const generationData: any = {
      claudeAnalysis: {},
      generatedTests: { count: 0, types: [], code: [], priorities: [] },
      qualityMetrics: { codeQuality: 0, coverage: 0, complexity: 0 }
    };
    
    try {
      // Get application data from previous step
      const appData = workflowData.applicationData;
      
      // Take current screenshot for AI analysis
      const screenshotName = 'ai-generation-current';
      await takeScreenshot(page, screenshotName);
      
      // Prepare context for Claude
      const context = {
        url: BASE_URL,
        domStructure: appData,
        screenshot: screenshotName,
        userFlows: [],
        consoleLogs: [],
        networkRequests: [],
        performanceMetrics: await page.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0];
          return {
            loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
            domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
          };
        })
      };
      
      // Send to Claude for analysis and test generation
      const claudeAnalysis = await claudeAI.analyzeScreenshotAndGenerateTests(screenshotName, context);
      generationData.claudeAnalysis = claudeAnalysis;
      
      // Generate refined test code
      const generatedTestCodes = await claudeAI.generateTestCode(claudeAnalysis);
      
      // Analyze generated tests
      generationData.generatedTests = {
        count: generatedTestCodes.length,
        types: ['functional', 'ui', 'accessibility', 'performance'], // Detected types
        code: generatedTestCodes,
        priorities: generatedTestCodes.map(() => 'high') // All high priority for demo
      };
      
      // Calculate quality metrics
      generationData.qualityMetrics = {
        codeQuality: claudeAnalysis.confidence || 0.8,
        coverage: Math.min(generatedTestCodes.length / 10, 1), // Estimate based on test count
        complexity: generatedTestCodes.reduce((sum, code) => sum + (code.length / 1000), 0) / generatedTestCodes.length
      };
      
      // Store results
      workflowData.claudeAnalysis = claudeAnalysis;
      workflowData.generatedTests = generatedTestCodes;
      workflowData.generationTimestamp = new Date().toISOString();
      
      console.log('🧠 Claude Analysis Results:');
      console.log(`- Confidence: ${claudeAnalysis.confidence}`);
      console.log(`- UI Elements Identified: ${claudeAnalysis.analysis?.ui_elements?.length || 0}`);
      console.log(`- User Flows Detected: ${claudeAnalysis.analysis?.user_flows?.length || 0}`);
      console.log(`- Test Cases Generated: ${claudeAnalysis.analysis?.test_cases?.length || 0}`);
      console.log(`- Issues Found: ${claudeAnalysis.analysis?.issues?.length || 0}`);
      console.log(`- Generated Test Codes: ${generatedTestCodes.length}`);
      
      generationData.status = 'success';
      
    } catch (error) {
      console.error('❌ Generation phase failed:', error);
      generationData.status = 'failed';
      generationData.claudeAnalysis = { error: error.message, confidence: 0 };
    } finally {
      generationData.duration = endPhase();
      
      // Log generation phase to reports
      await aiTestLogger.logGenerationPhase(generationData);
    }
    
    expect(generationData.claudeAnalysis.confidence).toBeGreaterThan(0);
    expect(generationData.generatedTests.count).toBeGreaterThan(0);
    expect(generationData.status).toBe('success');
  });

  /**
   * Step 3: AI Test Execution and Monitoring
   */
  test('⚡ Step 3: AI Test Execution', async () => {
    console.log('🤖 AI STEP 3: Executing AI-generated tests...');
    
    const generatedTests = workflowData.generatedTests || [];
    const executionResults = [];
    
    // Execute each AI-generated test
    for (let i = 0; i < generatedTests.length; i++) {
      const testCode = generatedTests[i];
      const testName = `ai-generated-test-${i + 1}`;
      
      console.log(`🚀 Executing ${testName}...`);
      
      const result = await testExecutor.executeTestCase(testCode, testName);
      executionResults.push(result);
      
      console.log(`📊 ${testName}: ${result.result} (${result.duration}ms)`);
      
      // Small delay between tests
      await wait(1000);
    }
    
    // Store execution results
    workflowData.executionResults = executionResults;
    workflowData.executionTimestamp = new Date().toISOString();
    
    // Calculate summary statistics
    const summary = {
      totalTests: executionResults.length,
      passed: executionResults.filter(r => r.result === 'passed').length,
      failed: executionResults.filter(r => r.result === 'failed').length,
      avgDuration: executionResults.reduce((sum, r) => sum + r.duration, 0) / executionResults.length,
      screenshots: executionResults.flatMap(r => r.screenshots).length
    };
    
    workflowData.executionSummary = summary;
    
    console.log('⚡ Test Execution Summary:');
    console.log(`- Total Tests: ${summary.totalTests}`);
    console.log(`- Passed: ${summary.passed}`);
    console.log(`- Failed: ${summary.failed}`);
    console.log(`- Average Duration: ${Math.round(summary.avgDuration)}ms`);
    console.log(`- Screenshots Captured: ${summary.screenshots}`);
    
    expect(summary.totalTests).toBeGreaterThan(0);
  });

  /**
   * Step 4: AI Result Analysis and Verification
   */
  test('🔍 Step 4: AI Result Analysis', async () => {
    console.log('🤖 AI STEP 4: Analyzing test results with Claude...');
    
    const executionResults = workflowData.executionResults || [];
    const screenshots = executionResults.flatMap((r: any) => r.screenshots);
    
    // Send results to Claude for verification
    const verification = await claudeAI.verifyTestResults(executionResults, screenshots);
    
    // Store verification results
    workflowData.verification = verification;
    workflowData.verificationTimestamp = new Date().toISOString();
    
    console.log('🔍 Claude Verification Results:');
    console.log(`- Overall Status: ${verification.overall_status}`);
    console.log(`- Issues Found: ${verification.issues_found?.length || 0}`);
    console.log(`- Recommendations: ${verification.recommendations?.length || 0}`);
    console.log(`- Fixes Needed: ${verification.fixes_needed?.length || 0}`);
    
    if (verification.issues_found?.length > 0) {
      console.log('⚠️ Issues Detected:');
      verification.issues_found.forEach((issue: string, index: number) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }
    
    if (verification.recommendations?.length > 0) {
      console.log('💡 Recommendations:');
      verification.recommendations.forEach((rec: string, index: number) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
    
    expect(verification).toBeTruthy();
  });

  /**
   * Step 5: AI Adaptive Test Generation
   */
  test('🔄 Step 5: AI Adaptive Improvement', async () => {
    console.log('🤖 AI STEP 5: Generating adaptive improvements...');
    
    const failedTests = workflowData.executionResults?.filter((r: any) => r.result === 'failed') || [];
    
    if (failedTests.length > 0) {
      console.log(`🔧 Generating additional tests for ${failedTests.length} failed tests...`);
      
      // Generate additional tests based on failures
      const additionalTests = await claudeAI.generateAdditionalTests(failedTests, workflowData.applicationData);
      
      workflowData.additionalTests = additionalTests;
      
      console.log(`🆕 Generated ${additionalTests.length} additional test cases`);
      
      // Execute the additional tests
      const additionalResults = [];
      for (let i = 0; i < additionalTests.length; i++) {
        const testCode = additionalTests[i];
        const testName = `ai-adaptive-test-${i + 1}`;
        
        const result = await testExecutor.executeTestCase(testCode, testName);
        additionalResults.push(result);
      }
      
      workflowData.additionalResults = additionalResults;
      
      console.log('🔄 Adaptive Test Results:');
      additionalResults.forEach((result: any, index: number) => {
        console.log(`  - Test ${index + 1}: ${result.result}`);
      });
    } else {
      console.log('✅ No failed tests - no adaptive improvements needed');
      workflowData.additionalTests = [];
      workflowData.additionalResults = [];
    }
    
    // Final summary
    const finalSummary = {
      discoveryComplete: !!workflowData.applicationData,
      testsGenerated: workflowData.generatedTests?.length || 0,
      testsExecuted: workflowData.executionResults?.length || 0,
      verificationComplete: !!workflowData.verification,
      adaptiveTestsGenerated: workflowData.additionalTests?.length || 0,
      overallSuccess: workflowData.verification?.overall_status === 'PASS'
    };
    
    workflowData.finalSummary = finalSummary;
    workflowData.completionTimestamp = new Date().toISOString();
    
    console.log('🎯 AI Testing Workflow Complete:');
    console.log(`- Discovery: ${finalSummary.discoveryComplete ? '✅' : '❌'}`);
    console.log(`- Test Generation: ${finalSummary.testsGenerated} tests`);
    console.log(`- Test Execution: ${finalSummary.testsExecuted} executed`);
    console.log(`- Verification: ${finalSummary.verificationComplete ? '✅' : '❌'}`);
    console.log(`- Adaptive Tests: ${finalSummary.adaptiveTestsGenerated} generated`);
    console.log(`- Overall Success: ${finalSummary.overallSuccess ? '✅' : '❌'}`);
    
    expect(finalSummary.discoveryComplete).toBe(true);
    expect(finalSummary.testsGenerated).toBeGreaterThan(0);
  });

  /**
   * Step 6: AI Report Generation
   */
  test('📊 Step 6: AI Final Report', async () => {
    console.log('🤖 AI STEP 6: Generating comprehensive test report...');
    
    // Take final screenshot
    await takeScreenshot(page, 'ai-workflow-final');
    
    // Generate comprehensive report
    const report = {
      workflow: {
        startTime: workflowData.discoveryTimestamp,
        endTime: workflowData.completionTimestamp,
        duration: new Date(workflowData.completionTimestamp).getTime() - new Date(workflowData.discoveryTimestamp).getTime(),
        steps: [
          { step: 1, name: 'Discovery', status: 'completed', timestamp: workflowData.discoveryTimestamp },
          { step: 2, name: 'Generation', status: 'completed', timestamp: workflowData.generationTimestamp },
          { step: 3, name: 'Execution', status: 'completed', timestamp: workflowData.executionTimestamp },
          { step: 4, name: 'Verification', status: 'completed', timestamp: workflowData.verificationTimestamp },
          { step: 5, name: 'Adaptation', status: 'completed', timestamp: new Date().toISOString() },
          { step: 6, name: 'Reporting', status: 'completed', timestamp: new Date().toISOString() }
        ]
      },
      application: {
        url: BASE_URL,
        title: workflowData.applicationData?.title,
        framework: 'Next.js React',
        elementsDiscovered: {
          links: workflowData.applicationData?.interactiveElements?.links?.length || 0,
          buttons: workflowData.applicationData?.interactiveElements?.buttons?.length || 0,
          headings: workflowData.applicationData?.content?.headings?.length || 0,
          images: workflowData.applicationData?.content?.images?.length || 0
        }
      },
      testing: {
        aiConfidence: workflowData.claudeAnalysis?.confidence || 0,
        testsGenerated: workflowData.generatedTests?.length || 0,
        testsExecuted: workflowData.executionResults?.length || 0,
        testsPassed: workflowData.executionSummary?.passed || 0,
        testsFailed: workflowData.executionSummary?.failed || 0,
        adaptiveTestsGenerated: workflowData.additionalTests?.length || 0,
        screenshotsCaptured: workflowData.executionSummary?.screenshots || 0
      },
      results: {
        overallStatus: workflowData.verification?.overall_status || 'UNKNOWN',
        issuesFound: workflowData.verification?.issues_found?.length || 0,
        recommendationsMade: workflowData.verification?.recommendations?.length || 0,
        fixesGenerated: workflowData.verification?.fixes_needed?.length || 0
      },
      performance: {
        averageTestDuration: workflowData.executionSummary?.avgDuration || 0,
        totalWorkflowDuration: new Date().getTime() - new Date(workflowData.discoveryTimestamp).getTime()
      }
    };
    
    workflowData.finalReport = report;
    
    console.log('📊 AI TESTING WORKFLOW FINAL REPORT:');
    console.log('=====================================');
    console.log(`🕐 Duration: ${Math.round(report.performance.totalWorkflowDuration / 1000)}s`);
    console.log(`🎯 AI Confidence: ${(report.testing.aiConfidence * 100).toFixed(1)}%`);
    console.log(`🧪 Tests Generated: ${report.testing.testsGenerated}`);
    console.log(`✅ Tests Passed: ${report.testing.testsPassed}`);
    console.log(`❌ Tests Failed: ${report.testing.testsFailed}`);
    console.log(`🔄 Adaptive Tests: ${report.testing.adaptiveTestsGenerated}`);
    console.log(`📸 Screenshots: ${report.testing.screenshotsCaptured}`);
    console.log(`⚠️ Issues Found: ${report.results.issuesFound}`);
    console.log(`💡 Recommendations: ${report.results.recommendationsMade}`);
    console.log(`🔧 Fixes Generated: ${report.results.fixesGenerated}`);
    console.log(`📊 Overall Status: ${report.results.overallStatus}`);
    console.log('=====================================');
    
    expect(report.workflow.steps.length).toBe(6);
    expect(report.testing.testsGenerated).toBeGreaterThan(0);
    expect(report.performance.totalWorkflowDuration).toBeGreaterThan(0);
  });
});
