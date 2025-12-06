/**
 * Chatbot Memory API - Semantic Search with Vectorize
 * 
 * POST /api/chatbot/memory - Store a memory/conversation snippet
 * GET /api/chatbot/memory - Search for relevant memories
 * DELETE /api/chatbot/memory - Clear memories
 * 
 * Uses Cloudflare Vectorize for semantic search
 * Uses OpenAI embeddings API for text-to-vector conversion
 */

/**
 * POST /api/chatbot/memory - Store a memory
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();
    const {
      conversationId,
      content,          // The text content to remember
      type,             // 'user_preference', 'faq', 'conversation', 'knowledge'
      metadata          // Additional metadata
    } = data;

    if (!content) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Content is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate embedding for the content
    const embedding = await generateEmbedding(env, content);
    
    if (!embedding) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to generate embedding'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const memoryId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    // Store in Vectorize if available
    if (env.VECTORIZE) {
      await env.VECTORIZE.upsert([{
        id: memoryId,
        values: embedding,
        metadata: {
          content: content.substring(0, 1000), // Truncate for metadata
          type: type || 'conversation',
          conversationId: conversationId || null,
          timestamp: now,
          ...metadata
        }
      }]);
      
      console.log(`🧠 Stored memory ${memoryId} in Vectorize`);
    }

    // Also store in D1 for full content retrieval
    if (env.DB) {
      try {
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS chatbot_memories (
            id TEXT PRIMARY KEY,
            conversation_id TEXT,
            content TEXT NOT NULL,
            type TEXT DEFAULT 'conversation',
            metadata TEXT,
            embedding_stored INTEGER DEFAULT 0,
            created_at INTEGER
          )
        `).run();
        
        await env.DB.prepare(`
          CREATE INDEX IF NOT EXISTS idx_memories_type ON chatbot_memories(type)
        `).run();
      } catch (e) { /* Table exists */ }

      await env.DB.prepare(`
        INSERT INTO chatbot_memories (id, conversation_id, content, type, metadata, embedding_stored, created_at)
        VALUES (?, ?, ?, ?, ?, 1, ?)
      `).bind(
        memoryId,
        conversationId || null,
        content,
        type || 'conversation',
        metadata ? JSON.stringify(metadata) : null,
        now
      ).run();
    }

    return new Response(JSON.stringify({
      success: true,
      memoryId,
      stored: {
        vectorize: !!env.VECTORIZE,
        d1: !!env.DB
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Memory storage error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * GET /api/chatbot/memory - Search memories
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const query = url.searchParams.get('query');
  const type = url.searchParams.get('type');
  const conversationId = url.searchParams.get('conversationId');
  const limit = parseInt(url.searchParams.get('limit')) || 5;

  if (!query) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Query parameter is required'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(env, query);
    
    if (!queryEmbedding) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to generate query embedding'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let results = [];

    // Search in Vectorize if available
    if (env.VECTORIZE) {
      const filter = {};
      if (type) filter.type = type;
      if (conversationId) filter.conversationId = conversationId;

      const vectorResults = await env.VECTORIZE.query(queryEmbedding, {
        topK: limit,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        returnMetadata: true
      });

      results = vectorResults.matches.map(match => ({
        id: match.id,
        score: match.score,
        content: match.metadata?.content,
        type: match.metadata?.type,
        conversationId: match.metadata?.conversationId,
        timestamp: match.metadata?.timestamp
      }));

      console.log(`🔍 Found ${results.length} memories via Vectorize`);
    }

    // Enrich with full content from D1 if available
    if (env.DB && results.length > 0) {
      const ids = results.map(r => r.id);
      const placeholders = ids.map(() => '?').join(',');
      
      const { results: dbResults } = await env.DB.prepare(
        `SELECT id, content, metadata FROM chatbot_memories WHERE id IN (${placeholders})`
      ).bind(...ids).all();

      const dbMap = new Map(dbResults?.map(r => [r.id, r]) || []);
      
      results = results.map(r => {
        const dbRecord = dbMap.get(r.id);
        return {
          ...r,
          content: dbRecord?.content || r.content,
          metadata: dbRecord?.metadata ? JSON.parse(dbRecord.metadata) : null
        };
      });
    }

    return new Response(JSON.stringify({
      success: true,
      query,
      results,
      count: results.length
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Memory search error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * DELETE /api/chatbot/memory - Clear memories
 */
export async function onRequestDelete(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const memoryId = url.searchParams.get('id');
  const conversationId = url.searchParams.get('conversationId');
  const clearAll = url.searchParams.get('clearAll') === 'true';

  try {
    let deletedCount = 0;

    if (clearAll) {
      // This is dangerous - require additional confirmation
      return new Response(JSON.stringify({
        success: false,
        error: 'clearAll requires admin authentication'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (memoryId) {
      // Delete specific memory
      if (env.VECTORIZE) {
        await env.VECTORIZE.deleteByIds([memoryId]);
      }
      if (env.DB) {
        await env.DB.prepare("DELETE FROM chatbot_memories WHERE id = ?").bind(memoryId).run();
      }
      deletedCount = 1;
    } else if (conversationId) {
      // Delete all memories for a conversation
      if (env.DB) {
        const { results } = await env.DB.prepare(
          "SELECT id FROM chatbot_memories WHERE conversation_id = ?"
        ).bind(conversationId).all();
        
        if (results && results.length > 0) {
          const ids = results.map(r => r.id);
          
          if (env.VECTORIZE) {
            await env.VECTORIZE.deleteByIds(ids);
          }
          
          await env.DB.prepare(
            "DELETE FROM chatbot_memories WHERE conversation_id = ?"
          ).bind(conversationId).run();
          
          deletedCount = ids.length;
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      deleted: deletedCount
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Memory delete error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Generate embedding using OpenAI or Workers AI
 */
async function generateEmbedding(env, text) {
  // Try OpenAI first
  let apiKey = null;
  if (env.KV) {
    apiKey = await env.KV.get('OPENAI_API_KEY');
  }
  if (!apiKey && env.OPENAI_API_KEY) {
    apiKey = env.OPENAI_API_KEY;
  }

  if (apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text.substring(0, 8000) // Limit input length
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.data[0].embedding;
      } else {
        console.error('OpenAI embedding error:', await response.text());
      }
    } catch (error) {
      console.error('OpenAI embedding error:', error);
    }
  }

  // Fallback to Workers AI if available
  if (env.AI) {
    try {
      const result = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
        text: text.substring(0, 8000)
      });
      return result.data[0];
    } catch (error) {
      console.error('Workers AI embedding error:', error);
    }
  }

  console.warn('No embedding service available');
  return null;
}
