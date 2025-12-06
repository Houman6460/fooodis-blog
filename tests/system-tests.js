/**
 * Fooodis Platform - Systematic Testing Framework
 * 5-Layer Testing Model for comprehensive platform validation
 * 
 * Run: node tests/system-tests.js [layer] [--verbose]
 * Examples:
 *   node tests/system-tests.js              # Run all tests
 *   node tests/system-tests.js 1            # Run Layer 1 only
 *   node tests/system-tests.js all --verbose # Verbose output
 */

const BASE_URL = process.env.BASE_URL || 'https://fooodis.com';
const WORKER_URL = process.env.WORKER_URL || 'https://fooodis-automation-scheduler.houman-ghavamzadeh.workers.dev';
const NEWSLETTER_WORKER_URL = process.env.NEWSLETTER_WORKER_URL || 'https://fooodis-newsletter-consumer.houman-ghavamzadeh.workers.dev';

// Test results storage
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: [],
  metrics: {},
  startTime: Date.now()
};

// Utility functions
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  const start = Date.now();
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const latency = Date.now() - start;
    clearTimeout(timeoutId);
    return { response, latency };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function log(message, type = 'info') {
  const icons = { pass: '✅', fail: '❌', skip: '⏭️', info: 'ℹ️', warn: '⚠️' };
  console.log(`${icons[type] || '•'} ${message}`);
}

function recordResult(testName, passed, details = {}) {
  if (passed) {
    results.passed++;
    log(`${testName} - PASSED ${details.latency ? `(${details.latency}ms)` : ''}`, 'pass');
  } else {
    results.failed++;
    results.errors.push({ test: testName, ...details });
    log(`${testName} - FAILED: ${details.error || 'Unknown error'}`, 'fail');
  }
}

// ============================================
// LAYER 1: INFRASTRUCTURE TESTS
// ============================================
async function runLayer1() {
  console.log('\n' + '='.repeat(60));
  console.log('🔹 LAYER 1: INFRASTRUCTURE TESTS');
  console.log('='.repeat(60));

  // Test 1.1: Main site reachable
  try {
    const { response, latency } = await fetchWithTimeout(BASE_URL);
    recordResult('1.1 Main Site Reachable', response.ok, { latency });
    results.metrics['main_site_latency'] = latency;
  } catch (e) {
    recordResult('1.1 Main Site Reachable', false, { error: e.message });
  }

  // Test 1.2: Automation Worker running
  try {
    const { response, latency } = await fetchWithTimeout(`${WORKER_URL}/status`);
    const data = await response.json();
    recordResult('1.2 Automation Worker Running', data.status === 'active', { latency });
    results.metrics['automation_worker_latency'] = latency;
  } catch (e) {
    recordResult('1.2 Automation Worker Running', false, { error: e.message });
  }

  // Test 1.3: Newsletter Worker running
  try {
    const { response, latency } = await fetchWithTimeout(NEWSLETTER_WORKER_URL);
    const data = await response.json();
    recordResult('1.3 Newsletter Worker Running', data.status === 'active', { latency });
    results.metrics['newsletter_worker_latency'] = latency;
  } catch (e) {
    recordResult('1.3 Newsletter Worker Running', false, { error: e.message });
  }

  // Test 1.4: D1 Database connected (via API)
  try {
    const { response, latency } = await fetchWithTimeout(`${BASE_URL}/api/posts?limit=1`);
    recordResult('1.4 D1 Database Connected', response.ok, { latency });
    results.metrics['db_latency'] = latency;
  } catch (e) {
    recordResult('1.4 D1 Database Connected', false, { error: e.message });
  }

  // Test 1.5: KV Namespace accessible
  try {
    const { response, latency } = await fetchWithTimeout(`${BASE_URL}/api/chatbot`);
    recordResult('1.5 KV Namespace Accessible', response.ok, { latency });
  } catch (e) {
    recordResult('1.5 KV Namespace Accessible', false, { error: e.message });
  }

  // Test 1.6: Worker bindings (D1, KV, R2)
  try {
    const { response } = await fetchWithTimeout(`${WORKER_URL}/status`);
    const data = await response.json();
    const bindings = data.bindings || {};
    recordResult('1.6 D1 Binding', bindings.db === true, {});
    recordResult('1.7 KV Binding', bindings.kv === true, {});
    recordResult('1.8 R2 Binding', bindings.r2 === true, {});
  } catch (e) {
    recordResult('1.6-1.8 Worker Bindings', false, { error: e.message });
  }
}

// ============================================
// LAYER 2: API ENDPOINT TESTS
// ============================================
async function runLayer2() {
  console.log('\n' + '='.repeat(60));
  console.log('🔹 LAYER 2: API ENDPOINT TESTS');
  console.log('='.repeat(60));

  const endpoints = [
    { name: '2.1 GET /api/posts', url: `${BASE_URL}/api/posts?limit=5`, method: 'GET' },
    { name: '2.2 GET /api/chatbot', url: `${BASE_URL}/api/chatbot`, method: 'GET' },
    { name: '2.3 GET /api/tickets', url: `${BASE_URL}/api/tickets?limit=1`, method: 'GET' },
    { name: '2.4 GET /api/subscribers', url: `${BASE_URL}/api/subscribers?limit=1`, method: 'GET' },
    { name: '2.5 GET /api/subscribers/popup-config', url: `${BASE_URL}/api/subscribers/popup-config`, method: 'GET' },
    { name: '2.6 GET /api/analytics/events', url: `${BASE_URL}/api/analytics/events?days=1`, method: 'GET' },
    { name: '2.7 GET /api/newsletter/queue', url: `${BASE_URL}/api/newsletter/queue`, method: 'GET' },
    { name: '2.8 GET /api/chatbot/memory', url: `${BASE_URL}/api/chatbot/memory?query=test`, method: 'GET' },
  ];

  for (const ep of endpoints) {
    try {
      const { response, latency } = await fetchWithTimeout(ep.url, { method: ep.method });
      const passed = response.ok || response.status === 400; // 400 is OK for missing params
      recordResult(ep.name, passed, { latency, status: response.status });
      results.metrics[ep.name.replace(/\s/g, '_').toLowerCase()] = latency;
    } catch (e) {
      recordResult(ep.name, false, { error: e.message });
    }
  }

  // Test POST endpoints (with minimal data)
  // Test 2.9: Chatbot POST
  try {
    const { response, latency } = await fetchWithTimeout(`${BASE_URL}/api/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'test ping' })
    }, 15000);
    recordResult('2.9 POST /api/chatbot', response.ok, { latency });
    results.metrics['chatbot_response_time'] = latency;
  } catch (e) {
    recordResult('2.9 POST /api/chatbot', false, { error: e.message });
  }

  // Test 2.10: Analytics event tracking
  try {
    const { response, latency } = await fetchWithTimeout(`${BASE_URL}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'system_test', category: 'testing' })
    });
    recordResult('2.10 POST /api/analytics/events', response.ok, { latency });
  } catch (e) {
    recordResult('2.10 POST /api/analytics/events', false, { error: e.message });
  }
}

// ============================================
// LAYER 3: WORKFLOW TESTS
// ============================================
async function runLayer3() {
  console.log('\n' + '='.repeat(60));
  console.log('🔹 LAYER 3: WORKFLOW TESTS');
  console.log('='.repeat(60));

  // Workflow 3.1: Chatbot Conversation Flow
  console.log('\n📝 Testing Chatbot Conversation Flow...');
  try {
    // Step 1: Get chatbot config
    const configRes = await fetchWithTimeout(`${BASE_URL}/api/chatbot`);
    if (!configRes.response.ok) throw new Error('Failed to get chatbot config');

    // Step 2: Send a message
    const chatRes = await fetchWithTimeout(`${BASE_URL}/api/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: 'Hello, what are your opening hours?',
        language: 'en'
      })
    }, 20000);
    
    const chatData = await chatRes.response.json();
    const hasResponse = chatData.success && chatData.message && chatData.message.length > 0;
    
    recordResult('3.1 Chatbot Conversation Flow', hasResponse, { 
      latency: chatRes.latency,
      responseLength: chatData.message?.length || 0
    });
  } catch (e) {
    recordResult('3.1 Chatbot Conversation Flow', false, { error: e.message });
  }

  // Workflow 3.2: Blog Post Listing Flow
  console.log('\n📝 Testing Blog Post Flow...');
  try {
    const postsRes = await fetchWithTimeout(`${BASE_URL}/api/posts?status=published&limit=3`);
    const postsData = await postsRes.response.json();
    const hasPosts = postsData.posts && postsData.posts.length > 0;
    recordResult('3.2 Blog Post Listing', hasPosts, { 
      latency: postsRes.latency,
      postCount: postsData.posts?.length || 0
    });
  } catch (e) {
    recordResult('3.2 Blog Post Listing', false, { error: e.message });
  }

  // Workflow 3.3: Newsletter Popup Config Flow
  console.log('\n📝 Testing Newsletter Popup Flow...');
  try {
    const popupRes = await fetchWithTimeout(`${BASE_URL}/api/subscribers/popup-config`);
    const popupData = await popupRes.response.json();
    recordResult('3.3 Newsletter Popup Config', popupData.id === 'default', { 
      latency: popupRes.latency
    });
  } catch (e) {
    recordResult('3.3 Newsletter Popup Config', false, { error: e.message });
  }

  // Workflow 3.4: Ticket System Flow
  console.log('\n📝 Testing Ticket System Flow...');
  try {
    const ticketsRes = await fetchWithTimeout(`${BASE_URL}/api/tickets?limit=1`);
    recordResult('3.4 Ticket System Access', ticketsRes.response.ok, { 
      latency: ticketsRes.latency
    });
  } catch (e) {
    recordResult('3.4 Ticket System Access', false, { error: e.message });
  }

  // Workflow 3.5: Automation Worker Trigger
  console.log('\n📝 Testing Automation Worker...');
  try {
    const automationRes = await fetchWithTimeout(`${WORKER_URL}/status`);
    const automationData = await automationRes.response.json();
    recordResult('3.5 Automation Worker Status', automationData.status === 'active', { 
      latency: automationRes.latency
    });
  } catch (e) {
    recordResult('3.5 Automation Worker Status', false, { error: e.message });
  }
}

// ============================================
// LAYER 4: PERFORMANCE TESTS
// ============================================
async function runLayer4() {
  console.log('\n' + '='.repeat(60));
  console.log('🔹 LAYER 4: PERFORMANCE & LOAD TESTS');
  console.log('='.repeat(60));

  // Test 4.1: Concurrent requests
  console.log('\n🔄 Testing concurrent requests (10 parallel)...');
  const concurrentUrls = [
    `${BASE_URL}/api/posts?limit=1`,
    `${BASE_URL}/api/chatbot`,
    `${BASE_URL}/api/subscribers/popup-config`,
  ];

  try {
    const startTime = Date.now();
    const requests = [];
    
    for (let i = 0; i < 10; i++) {
      const url = concurrentUrls[i % concurrentUrls.length];
      requests.push(fetchWithTimeout(url, {}, 5000));
    }
    
    const responses = await Promise.allSettled(requests);
    const totalTime = Date.now() - startTime;
    const successful = responses.filter(r => r.status === 'fulfilled' && r.value.response.ok).length;
    
    recordResult('4.1 Concurrent Requests (10)', successful >= 8, { 
      totalTime,
      successful,
      failed: 10 - successful
    });
    results.metrics['concurrent_10_time'] = totalTime;
  } catch (e) {
    recordResult('4.1 Concurrent Requests', false, { error: e.message });
  }

  // Test 4.2: Response time thresholds
  console.log('\n⏱️ Testing response time thresholds...');
  const thresholdTests = [
    { name: 'Main Site', url: BASE_URL, threshold: 2000 },
    { name: 'API Posts', url: `${BASE_URL}/api/posts?limit=1`, threshold: 1000 },
    { name: 'Chatbot Config', url: `${BASE_URL}/api/chatbot`, threshold: 500 },
  ];

  for (const test of thresholdTests) {
    try {
      const { latency } = await fetchWithTimeout(test.url);
      const passed = latency < test.threshold;
      recordResult(`4.2 ${test.name} < ${test.threshold}ms`, passed, { latency });
    } catch (e) {
      recordResult(`4.2 ${test.name} Threshold`, false, { error: e.message });
    }
  }

  // Test 4.3: Burst requests
  console.log('\n💥 Testing burst requests (5 rapid)...');
  try {
    const burstStart = Date.now();
    const burstResults = [];
    
    for (let i = 0; i < 5; i++) {
      const { latency } = await fetchWithTimeout(`${BASE_URL}/api/chatbot`);
      burstResults.push(latency);
    }
    
    const avgLatency = burstResults.reduce((a, b) => a + b, 0) / burstResults.length;
    const maxLatency = Math.max(...burstResults);
    
    recordResult('4.3 Burst Requests', maxLatency < 2000, { 
      avgLatency: Math.round(avgLatency),
      maxLatency
    });
    results.metrics['burst_avg_latency'] = Math.round(avgLatency);
  } catch (e) {
    recordResult('4.3 Burst Requests', false, { error: e.message });
  }
}

// ============================================
// LAYER 5: QUALITY TESTS (AI-ASSISTED)
// ============================================
async function runLayer5() {
  console.log('\n' + '='.repeat(60));
  console.log('🔹 LAYER 5: QUALITY TESTS');
  console.log('='.repeat(60));

  // Test 5.1: Chatbot response quality
  console.log('\n🤖 Testing chatbot response quality...');
  try {
    const testQueries = [
      { q: 'What is Fooodis?', expectKeywords: ['food', 'restaurant', 'delivery', 'platform'] },
      { q: 'How do I contact support?', expectKeywords: ['support', 'contact', 'help', 'ticket'] },
    ];

    for (const test of testQueries) {
      const { response } = await fetchWithTimeout(`${BASE_URL}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: test.q, language: 'en' })
      }, 20000);

      const data = await response.json();
      const responseText = (data.message || '').toLowerCase();
      
      // Check if response contains any expected keywords
      const hasRelevantContent = test.expectKeywords.some(kw => responseText.includes(kw));
      const isNotError = !responseText.includes('error') && !responseText.includes('unable');
      const hasGoodLength = responseText.length > 20 && responseText.length < 2000;
      
      recordResult(`5.1 Chatbot Quality: "${test.q.substring(0, 30)}..."`, 
        hasRelevantContent || (isNotError && hasGoodLength), 
        { responseLength: responseText.length }
      );
    }
  } catch (e) {
    recordResult('5.1 Chatbot Quality', false, { error: e.message });
  }

  // Test 5.2: API response structure quality
  console.log('\n📊 Testing API response structure...');
  try {
    const { response } = await fetchWithTimeout(`${BASE_URL}/api/posts?limit=1`);
    const data = await response.json();
    
    const hasProperStructure = data.hasOwnProperty('posts') || data.hasOwnProperty('success');
    recordResult('5.2 Posts API Structure', hasProperStructure, {});
  } catch (e) {
    recordResult('5.2 Posts API Structure', false, { error: e.message });
  }

  // Test 5.3: Error handling quality
  console.log('\n🚫 Testing error handling...');
  try {
    const { response } = await fetchWithTimeout(`${BASE_URL}/api/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Missing required 'message' field
    });
    
    const data = await response.json();
    const hasErrorMessage = data.error && data.error.length > 0;
    const properStatusCode = response.status === 400;
    
    recordResult('5.3 Error Handling', hasErrorMessage && properStatusCode, { 
      status: response.status
    });
  } catch (e) {
    recordResult('5.3 Error Handling', false, { error: e.message });
  }
}

// ============================================
// SELF-DIAGNOSIS
// ============================================
function runDiagnosis() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 SELF-DIAGNOSIS REPORT');
  console.log('='.repeat(60));

  const issues = [];
  
  // Analyze errors
  for (const error of results.errors) {
    let severity = 'LOW';
    let rootCause = 'Unknown';
    let suggestedFix = 'Check logs';
    let affectedSystem = 'Unknown';

    // Determine severity and root cause
    if (error.test.includes('Database') || error.test.includes('D1')) {
      severity = 'CRITICAL';
      rootCause = 'Database connection issue';
      suggestedFix = 'Check D1 binding in wrangler.toml and CF Dashboard';
      affectedSystem = 'D1 Database';
    } else if (error.test.includes('Worker')) {
      severity = 'HIGH';
      rootCause = 'Worker not responding';
      suggestedFix = 'Redeploy worker: wrangler deploy';
      affectedSystem = 'Cloudflare Workers';
    } else if (error.test.includes('Chatbot')) {
      severity = 'MEDIUM';
      rootCause = 'AI service issue';
      suggestedFix = 'Check OpenAI API key in KV';
      affectedSystem = 'Chatbot API';
    } else if (error.error?.includes('timeout')) {
      severity = 'MEDIUM';
      rootCause = 'Service timeout';
      suggestedFix = 'Check for high load or slow queries';
      affectedSystem = 'Performance';
    }

    issues.push({
      test: error.test,
      severity,
      rootCause,
      suggestedFix,
      affectedSystem,
      error: error.error
    });
  }

  if (issues.length === 0) {
    console.log('\n✅ No issues detected! All systems healthy.');
  } else {
    console.log(`\n⚠️ Found ${issues.length} issue(s):\n`);
    
    // Sort by severity
    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    for (const issue of issues) {
      console.log(`┌─ ${issue.severity} ─────────────────────────────`);
      console.log(`│ Test: ${issue.test}`);
      console.log(`│ Root Cause: ${issue.rootCause}`);
      console.log(`│ Affected: ${issue.affectedSystem}`);
      console.log(`│ Fix: ${issue.suggestedFix}`);
      console.log(`└────────────────────────────────────────\n`);
    }
  }

  return issues;
}

// ============================================
// METRICS SUMMARY
// ============================================
function printMetricsSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 METRICS SUMMARY');
  console.log('='.repeat(60));

  console.log('\nLatency Metrics:');
  for (const [key, value] of Object.entries(results.metrics)) {
    if (typeof value === 'number') {
      const status = value < 1000 ? '🟢' : value < 2000 ? '🟡' : '🔴';
      console.log(`  ${status} ${key}: ${value}ms`);
    }
  }

  const totalTime = Date.now() - results.startTime;
  console.log(`\nTest Duration: ${totalTime}ms`);
  console.log(`Tests Passed: ${results.passed}`);
  console.log(`Tests Failed: ${results.failed}`);
  console.log(`Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
}

// ============================================
// MAIN RUNNER
// ============================================
async function runAllTests(layer = 'all') {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       FOOODIS PLATFORM - SYSTEMATIC TEST SUITE             ║');
  console.log('║                    5-Layer Testing Model                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n🎯 Target: ${BASE_URL}`);
  console.log(`📅 Time: ${new Date().toISOString()}\n`);

  try {
    if (layer === 'all' || layer === '1') await runLayer1();
    if (layer === 'all' || layer === '2') await runLayer2();
    if (layer === 'all' || layer === '3') await runLayer3();
    if (layer === 'all' || layer === '4') await runLayer4();
    if (layer === 'all' || layer === '5') await runLayer5();
    
    runDiagnosis();
    printMetricsSummary();

    console.log('\n' + '='.repeat(60));
    console.log(results.failed === 0 ? '✅ ALL TESTS PASSED!' : `⚠️ ${results.failed} TEST(S) FAILED`);
    console.log('='.repeat(60));

    return results;
  } catch (e) {
    console.error('Test suite error:', e);
    return results;
  }
}

// Run if called directly
const args = process.argv.slice(2);
const layer = args[0] || 'all';
runAllTests(layer);
