export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          About AI Store
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          AI Store is a demonstration e-commerce platform designed specifically for testing 
          AI-driven automated testing systems. Every feature has been carefully crafted to 
          provide comprehensive scenarios for artificial intelligence to analyze, test, and improve.
        </p>
      </section>

      {/* Mission Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
          <p className="text-gray-600 mb-4">
            We're pioneering the future of software testing by creating applications that serve 
            as perfect training grounds for AI testing systems. Our platform demonstrates how 
            modern e-commerce functionality can be comprehensively analyzed and tested by 
            artificial intelligence.
          </p>
          <p className="text-gray-600 mb-6">
            Every interaction, form, and user flow in AI Store has been designed to challenge 
            and teach AI systems about real-world application testing scenarios.
          </p>
          <div className="space-y-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">AI-Driven Test Generation</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Autonomous Quality Assurance</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Intelligent Bug Detection</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Self-Healing Test Suites</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">AI Testing Features</h3>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-2">🤖 Automated Test Discovery</h4>
              <p className="text-sm text-gray-600">
                AI analyzes the application structure and automatically generates comprehensive test cases
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-2">📊 Intelligent Analytics</h4>
              <p className="text-sm text-gray-600">
                Real-time analysis of user interactions, performance metrics, and accessibility compliance
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-2">🔧 Auto-Generated Fixes</h4>
              <p className="text-sm text-gray-600">
                AI identifies issues and automatically generates code fixes and improvements
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
          Technology Stack
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">N</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Next.js 14</h3>
            <p className="text-sm text-gray-600">React framework with App Router</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600">AI</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Claude AI</h3>
            <p className="text-sm text-gray-600">AI-powered test generation</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-green-600">P</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Puppeteer</h3>
            <p className="text-sm text-gray-600">Browser automation and testing</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-yellow-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-yellow-600">TS</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-2">TypeScript</h3>
            <p className="text-sm text-gray-600">Type-safe development</p>
          </div>
        </div>
      </section>

      {/* AI Testing Capabilities */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
          AI Testing Capabilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-blue-600 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Visual Analysis</h3>
            <p className="text-gray-600 mb-4">
              AI analyzes screenshots to understand UI layout, identify interactive elements, 
              and detect visual inconsistencies across different screen sizes and browsers.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Component identification</li>
              <li>• Layout validation</li>
              <li>• Responsive design testing</li>
              <li>• Visual regression detection</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-green-600 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Functional Testing</h3>
            <p className="text-gray-600 mb-4">
              Automated testing of user interactions, form submissions, API calls, 
              and business logic validation with intelligent error detection.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Form validation testing</li>
              <li>• API endpoint verification</li>
              <li>• User flow automation</li>
              <li>• Error handling validation</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-purple-600 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Performance Analytics</h3>
            <p className="text-gray-600 mb-4">
              Comprehensive performance monitoring including load times, Core Web Vitals, 
              accessibility compliance, and optimization recommendations.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Load time analysis</li>
              <li>• Core Web Vitals monitoring</li>
              <li>• Accessibility auditing</li>
              <li>• SEO optimization checks</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">AI Testing Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">100%</div>
            <div className="text-blue-100">Automated Coverage</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">95%</div>
            <div className="text-blue-100">Bug Detection Rate</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">80%</div>
            <div className="text-blue-100">Time Savings</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">24/7</div>
            <div className="text-blue-100">Continuous Monitoring</div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Experience AI-Driven Testing
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          See how artificial intelligence can revolutionize your testing workflow. 
          Our AI system learns, adapts, and improves with every test run.
        </p>
        <div className="space-x-4">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Start AI Testing
          </button>
          <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            View Documentation
          </button>
        </div>
      </section>
    </div>
  )
}
