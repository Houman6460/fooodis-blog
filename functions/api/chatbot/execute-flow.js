/**
 * Flow Execution API - Execute node flow logic for chatbot
 * POST /api/chatbot/execute-flow - Execute a node and get next action
 * 
 * This API processes user messages through the visual flow nodes
 */

/**
 * POST /api/chatbot/execute-flow
 * Body: { currentNodeId, userMessage, language, sessionId, context }
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const data = await request.json();
    const { currentNodeId, userMessage, language = 'en', sessionId, context: userContext } = data;

    // Load the flow for this language
    const { results: flowResults } = await env.DB.prepare(
      "SELECT * FROM chatbot_flows WHERE language = ? AND is_active = 1 ORDER BY updated_at DESC LIMIT 1"
    ).bind(language).all();

    if (!flowResults || flowResults.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "No active flow found for language: " + language 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const flow = flowResults[0];
    const nodes = JSON.parse(flow.nodes || '[]');
    const connections = JSON.parse(flow.connections || '[]');

    // Find current node or start with welcome node
    let currentNode = null;
    if (currentNodeId) {
      currentNode = nodes.find(n => n.id === currentNodeId);
    } else {
      // Start with welcome node
      currentNode = nodes.find(n => n.type === 'welcome');
    }

    if (!currentNode) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Node not found" 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Execute the node
    const result = await executeNode(currentNode, userMessage, language, nodes, connections, env);

    return new Response(JSON.stringify({
      success: true,
      ...result
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Flow execution error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * Execute a node and return the result
 */
async function executeNode(node, userMessage, language, nodes, connections, env) {
  const result = {
    nodeId: node.id,
    nodeType: node.type,
    message: null,
    quickReplies: [],
    nextNodeId: null,
    action: null,
    handoffData: null
  };

  switch (node.type) {
    case 'welcome':
      result.message = getNodeMessage(node, language);
      result.nextNodeId = getNextNodeId(node.id, connections);
      result.action = result.nextNodeId ? 'continue' : 'wait';
      break;

    case 'message':
      result.message = getNodeMessage(node, language);
      result.nextNodeId = getNextNodeId(node.id, connections);
      result.action = result.nextNodeId ? 'continue' : 'wait';
      break;

    case 'intent':
      const intentResult = processIntentNode(node, userMessage, connections);
      result.message = intentResult.message;
      result.nextNodeId = intentResult.nextNodeId;
      result.action = intentResult.action;
      result.detectedIntent = intentResult.detectedIntent;
      break;

    case 'condition':
      const conditionResult = processConditionNode(node, userMessage, connections);
      result.nextNodeId = conditionResult.nextNodeId;
      result.action = 'continue';
      break;

    case 'handoff':
      result.action = 'handoff';
      result.handoffData = {
        department: node.data.department,
        agentId: node.data.selectedAgent || node.data.agents?.[0],
        message: node.data.handoffMessage || getHandoffMessage(language)
      };
      result.message = result.handoffData.message;
      
      // Load agent details if available
      if (result.handoffData.agentId && env.DB) {
        const { results: agentResults } = await env.DB.prepare(
          "SELECT * FROM chatbot_agents WHERE id = ?"
        ).bind(result.handoffData.agentId).all();
        
        if (agentResults && agentResults.length > 0) {
          const agent = agentResults[0];
          result.handoffData.agent = {
            id: agent.id,
            name: agent.name,
            avatar: agent.avatar,
            assignedAssistantId: agent.assigned_assistant_id
          };
        }
      }
      break;

    default:
      result.message = "I'm not sure how to handle this. Let me connect you with support.";
      result.action = 'fallback';
  }

  return result;
}

/**
 * Get message from node based on language
 */
function getNodeMessage(node, language) {
  if (!node.data || !node.data.messages) {
    return node.data?.title || "Hello!";
  }

  const langKey = language === 'sv' ? 'swedish' : 'english';
  return node.data.messages[langKey] || 
         node.data.messages.english || 
         node.data.messages.en ||
         node.data.title ||
         "Hello!";
}

/**
 * Get next node ID from connections
 */
function getNextNodeId(currentNodeId, connections) {
  const outgoing = connections.filter(c => c.from === currentNodeId);
  return outgoing.length > 0 ? outgoing[0].to : null;
}

/**
 * Process intent detection node
 */
function processIntentNode(node, userMessage, connections) {
  const intents = node.data.intents || [];
  const messageLower = (userMessage || '').toLowerCase();
  
  // Simple keyword matching (can be enhanced with NLP)
  let detectedIntent = null;
  
  // Intent keyword mappings
  const intentKeywords = {
    'menu-help': ['menu', 'food', 'dish', 'eat', 'order', 'what can i get'],
    'ordering-help': ['order', 'buy', 'purchase', 'checkout', 'cart'],
    'technical-support': ['technical', 'error', 'bug', 'problem', 'issue', 'not working', 'help'],
    'billing-question': ['bill', 'invoice', 'payment', 'charge', 'price', 'cost'],
    'delivery': ['delivery', 'deliver', 'shipping', 'track', 'where is my'],
    'customer-support': ['support', 'help', 'question', 'contact'],
    'sales': ['pricing', 'plan', 'subscribe', 'upgrade', 'demo']
  };

  // Check each intent configured in the node
  for (const intent of intents) {
    const keywords = intentKeywords[intent] || [intent];
    if (keywords.some(kw => messageLower.includes(kw))) {
      detectedIntent = intent;
      break;
    }
  }

  // Find connection for detected intent
  const outgoing = connections.filter(c => c.from === node.id);
  let nextNodeId = null;

  if (detectedIntent && outgoing.length > 0) {
    // For now, use first connection (can be enhanced to route by intent)
    nextNodeId = outgoing[0].to;
  }

  return {
    message: detectedIntent ? null : "I'm not sure I understand. Could you please tell me more about what you need help with?",
    nextNodeId: nextNodeId,
    action: detectedIntent ? 'continue' : 'wait',
    detectedIntent: detectedIntent
  };
}

/**
 * Process condition node
 */
function processConditionNode(node, userMessage, connections) {
  const condition = node.data.condition || '';
  const messageLower = (userMessage || '').toLowerCase();
  
  // Simple condition evaluation
  let conditionMet = false;
  
  if (condition.includes('contains:')) {
    const keyword = condition.split('contains:')[1].trim().toLowerCase();
    conditionMet = messageLower.includes(keyword);
  } else if (condition.includes('equals:')) {
    const value = condition.split('equals:')[1].trim().toLowerCase();
    conditionMet = messageLower === value;
  } else {
    // Default: check if message contains condition text
    conditionMet = messageLower.includes(condition.toLowerCase());
  }

  // Find appropriate connection (true/false)
  const outgoing = connections.filter(c => c.from === node.id);
  let nextNodeId = null;

  if (outgoing.length > 0) {
    // Look for labeled connections (true/false) or use first one
    const trueConn = outgoing.find(c => c.label === 'true' || c.condition === true);
    const falseConn = outgoing.find(c => c.label === 'false' || c.condition === false);
    
    nextNodeId = conditionMet ? 
      (trueConn?.to || outgoing[0].to) : 
      (falseConn?.to || outgoing[0].to);
  }

  return { nextNodeId };
}

/**
 * Get handoff message based on language
 */
function getHandoffMessage(language) {
  if (language === 'sv') {
    return "Jag kopplar dig till en av våra agenter som kan hjälpa dig bättre. Vänligen vänta ett ögonblick...";
  }
  return "I'm connecting you with one of our agents who can better assist you. Please wait a moment...";
}
