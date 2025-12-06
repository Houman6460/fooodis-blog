/**
 * OpenAI Health Check - Test OpenAI API connectivity
 * GET /api/health/openai - Test if OpenAI API is working
 */

export async function onRequestGet(context) {
  const { env } = context;
  
  const results = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // Check 1: Is API key configured?
  let apiKey = null;
  try {
    if (env.KV) {
      apiKey = await env.KV.get('OPENAI_API_KEY');
      results.checks.key_in_kv = apiKey ? 'found' : 'not_found';
      results.checks.key_length = apiKey ? apiKey.length : 0;
      results.checks.key_prefix = apiKey ? apiKey.substring(0, 7) + '...' : null;
    } else {
      results.checks.kv = 'not_available';
    }
  } catch (e) {
    results.checks.key_check = 'error: ' + e.message;
  }

  // Check 2: Can we reach OpenAI?
  if (apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      results.checks.openai_connection = response.ok ? 'ok' : 'failed';
      results.checks.openai_status = response.status;
      
      if (!response.ok) {
        const errorText = await response.text();
        results.checks.openai_error = errorText.substring(0, 200);
      } else {
        const data = await response.json();
        results.checks.models_available = data.data?.length || 0;
      }
    } catch (e) {
      results.checks.openai_connection = 'error';
      results.checks.openai_error = e.message;
    }

    // Check 3: Test a simple completion
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Say "test ok" and nothing else.' }],
          max_tokens: 10
        })
      });

      results.checks.completion_test = response.ok ? 'ok' : 'failed';
      results.checks.completion_status = response.status;
      
      if (response.ok) {
        const data = await response.json();
        results.checks.completion_response = data.choices?.[0]?.message?.content || 'no response';
      } else {
        const errorText = await response.text();
        results.checks.completion_error = errorText.substring(0, 300);
      }
    } catch (e) {
      results.checks.completion_test = 'error';
      results.checks.completion_error = e.message;
    }
  }

  results.status = results.checks.completion_test === 'ok' ? 'healthy' : 'unhealthy';

  return new Response(JSON.stringify(results, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}
