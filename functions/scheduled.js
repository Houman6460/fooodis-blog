/**
 * Cloudflare Scheduled Worker
 * Runs AI automation on a schedule (every hour)
 */

export async function onSchedule(context) {
  const { env } = context;
  
  console.log('Scheduled automation triggered at:', new Date().toISOString());
  
  try {
    // Get automation paths from KV storage
    const automationPathsJson = await env.KV.get('automation-paths');
    
    if (!automationPathsJson) {
      console.log('No automation paths configured');
      return;
    }
    
    const automationPaths = JSON.parse(automationPathsJson);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay(); // 0 = Sunday
    const currentDate = now.getDate();
    
    console.log(`Current time: ${currentHour}:${currentMinute}, Day: ${currentDay}, Date: ${currentDate}`);
    
    // Check each active path
    for (const path of automationPaths) {
      if (!path.active) continue;
      
      const schedule = path.schedule;
      if (!schedule || !schedule.time) continue;
      
      // Parse scheduled time
      const [schedHour, schedMinute] = schedule.time.split(':').map(Number);
      
      // Check if it's time to run
      let shouldRun = false;
      
      if (schedule.type === 'daily') {
        // Run if within 30 minutes of scheduled time
        if (schedHour === currentHour && Math.abs(schedMinute - currentMinute) < 30) {
          shouldRun = true;
        }
      } else if (schedule.type === 'weekly') {
        if (schedule.day === currentDay && schedHour === currentHour && Math.abs(schedMinute - currentMinute) < 30) {
          shouldRun = true;
        }
      } else if (schedule.type === 'monthly') {
        if (schedule.day === currentDate && schedHour === currentHour && Math.abs(schedMinute - currentMinute) < 30) {
          shouldRun = true;
        }
      }
      
      if (shouldRun) {
        console.log(`Running automation path: ${path.name}`);
        await runAutomationPath(path, env);
      }
    }
    
  } catch (error) {
    console.error('Scheduled automation error:', error);
  }
}

async function runAutomationPath(path, env) {
  try {
    // Get OpenAI API key from KV
    const aiConfig = await env.KV.get('ai-config');
    if (!aiConfig) {
      console.error('AI config not found in KV storage');
      return;
    }
    
    const config = JSON.parse(aiConfig);
    if (!config.apiKey) {
      console.error('OpenAI API key not configured');
      return;
    }
    
    // Generate content using OpenAI
    const content = await generateContent(path, config.apiKey);
    
    if (!content) {
      console.error('Failed to generate content');
      return;
    }
    
    // Save post to D1
    const postId = crypto.randomUUID();
    const now = Date.now();
    
    await env.DB.prepare(`
      INSERT INTO blog_posts (
        id, title, content, excerpt, image_url, author, category, 
        tags, published_date, status, created_at, updated_at, slug
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      postId,
      content.title,
      content.content,
      content.excerpt || '',
      content.image_url || '',
      'AI Automation',
      path.category || 'Uncategorized',
      JSON.stringify(path.tags || []),
      new Date().toISOString(),
      'published',
      now,
      now,
      content.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    ).run();
    
    console.log(`Created post: ${content.title} (ID: ${postId})`);
    
  } catch (error) {
    console.error('Error running automation path:', error);
  }
}

async function generateContent(path, apiKey) {
  const prompt = path.promptTemplate || `Create a blog post about ${path.topics || 'restaurant management'}. 
Include a catchy title and engaging content with practical tips.`;
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a blog content writer. Generate blog posts in JSON format with title, content (HTML), and excerpt fields.'
          },
          {
            role: 'user',
            content: `${prompt}\n\nRespond with a JSON object containing: title, content (as HTML), and excerpt.`
          }
        ],
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    const text = data.choices[0]?.message?.content;
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error('OpenAI request error:', error);
    return null;
  }
}
