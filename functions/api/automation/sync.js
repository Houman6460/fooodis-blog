/**
 * API endpoint to sync automation settings to KV storage
 * This allows the scheduled worker to access automation paths
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    
    // Save automation paths to KV
    if (data.automationPaths) {
      await env.KV.put('automation-paths', JSON.stringify(data.automationPaths));
      console.log('Saved', data.automationPaths.length, 'automation paths to KV');
    }
    
    // Save AI config to KV
    if (data.aiConfig) {
      await env.KV.put('ai-config', JSON.stringify(data.aiConfig));
      console.log('Saved AI config to KV');
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Automation settings synced to cloud'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error syncing automation settings:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    const automationPaths = await env.KV.get('automation-paths');
    const aiConfig = await env.KV.get('ai-config');
    
    return new Response(JSON.stringify({
      automationPaths: automationPaths ? JSON.parse(automationPaths) : [],
      hasAiConfig: !!aiConfig
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
