// Cloudflare Pages Function for Jaydus AI Platform API
// This handles all /api/* routes

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Rate limiting configuration
const RATE_LIMITS = {
  chat: { requests: 20, window: 3600 }, // 20 requests per hour
  images: { requests: 10, window: 3600 }, // 10 requests per hour  
  search: { requests: 30, window: 3600 } // 30 requests per hour
};

// Simple rate limiter using KV (if available)
async function checkRateLimit(clientIP, endpoint, env) {
  if (!env.RATE_LIMIT_KV) return true; // Skip if KV not available
  
  const key = `rate_limit:${clientIP}:${endpoint}`;
  const now = Date.now();
  const windowMs = RATE_LIMITS[endpoint]?.window * 1000 || 3600000;
  const limit = RATE_LIMITS[endpoint]?.requests || 20;
  
  try {
    const data = await env.RATE_LIMIT_KV.get(key, 'json');
    const requests = data || { count: 0, resetTime: now + windowMs };
    
    if (now > requests.resetTime) {
      requests.count = 1;
      requests.resetTime = now + windowMs;
    } else {
      requests.count++;
    }
    
    await env.RATE_LIMIT_KV.put(key, JSON.stringify(requests), { expirationTtl: windowMs / 1000 });
    
    return requests.count <= limit;
  } catch {
    return true; // Allow on error
  }
}

// Input sanitization
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .substring(0, 10000); // Limit length
}

// Handle CORS preflight
async function handleOptions() {
  return new Response(null, { headers: corsHeaders });
}

// Chat API - AIML Integration
async function handleChat(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { messages, model = 'gpt-4o-mini', stream = false } = await request.json();
    
    // Sanitize inputs
    const sanitizedMessages = messages.map(msg => ({
      ...msg,
      content: sanitizeInput(msg.content)
    }));

    // Map frontend model names to AIML API model names
    const aimlModelMap = {
      'openai/gpt-4o-mini': 'openai/gpt-5-mini-2025-08-07',
      'openai/gpt-4o': 'google/gemini-2.5-pro',
      'anthropic/claude-3.5-sonnet': 'moonshot/kimi-k2-preview'
    };
    
    const aimlModel = aimlModelMap[model] || 'gpt-4o-mini';
    
    const aimlResponse = await fetch('https://api.aimlapi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.AIML_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: aimlModel,
        messages: sanitizedMessages,
        stream,
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (stream) {
      return new Response(aimlResponse.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } else {
      const data = await aimlResponse.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: 'Chat processing failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Images API - Dual API Support
async function handleImages(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const { prompt, aspectRatio = '16:9', model = 'photon-flash' } = await request.json();
  
  // Sanitize inputs
  const sanitizedPrompt = sanitizeInput(prompt);

  if (!['photon-flash', 'photon-2', 'flux-1-kontext-pro', 'seedream-3-0'].includes(model)) {
    return new Response(JSON.stringify({ error: 'Invalid model' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Handle AIML models (Flux and SeeDream)
    if (['flux-1-kontext-pro', 'seedream-3-0'].includes(model)) {
      const modelMap = {
        'flux-1-kontext-pro': 'flux/kontext-pro/text-to-image',
        'seedream-3-0': 'bytedance/seedream-3.0'
      };
      
      const response = await fetch('https://api.aimlapi.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.AIML_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelMap[model],
          prompt: sanitizedPrompt,
          n: 1,
          size: aspectRatio === '1:1' ? '1024x1024' : aspectRatio === '16:9' ? '1344x768' : '1024x1024'
        })
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle Photon models via Luma API
    const lumaModelMap = {
      'photon-flash': 'ray-flash-2',
      'photon-2': 'ray-2'
    };
    
    const response = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.LUMA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: sanitizedPrompt,
        aspect_ratio: aspectRatio,
        model: lumaModelMap[model] || model
      })
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return new Response(JSON.stringify({ error: 'Image generation failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Search API - Perplexity Sonar
async function handleSearch(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { query } = await request.json();
    
    // Sanitize input
    const sanitizedQuery = sanitizeInput(query);
    
    // Use Perplexity Sonar API for real search
    try {
      const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'Be precise and concise. Provide a direct answer followed by key supporting information. Include relevant sources when possible.'
            },
            {
              role: 'user', 
              content: sanitizedQuery
            }
          ]
        })
      });

      if (perplexityResponse.ok) {
        const perplexityData = await perplexityResponse.json();
        const content = perplexityData.choices[0]?.message?.content || '';
        
        const response = {
          query: sanitizedQuery,
          synthesizedResponse: content,
          sources: [],
          relatedQuestions: [
            `What are the latest developments in ${sanitizedQuery}?`,
            `How does ${sanitizedQuery} work?`,
            `What are the benefits of ${sanitizedQuery}?`
          ]
        };

        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } catch (perplexityError) {
      console.error('Perplexity API error:', perplexityError);
    }

    // Fallback response if Perplexity fails
    const response = {
      query: sanitizedQuery,
      synthesizedResponse: `**Direct Answer**: Here's what I found about "${sanitizedQuery}".\n\n**Analysis**: Real-time search results would appear here. The search functionality is ready for Perplexity integration.`,
      sources: [],
      relatedQuestions: [
        `What are the latest developments in ${sanitizedQuery}?`,
        `How does ${sanitizedQuery} work?`,
        `What are the benefits of ${sanitizedQuery}?`
      ]
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Search failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Error logging
function logError(error, context) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] API Error:`, {
    message: error.message,
    stack: error.stack,
    path: context.path,
    method: context.method,
    ip: context.ip
  });
}

// Main request handler
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleOptions();
  }

  // Rate limiting
  const endpoint = path.split('/').pop();
  if (['chat', 'images', 'search'].includes(endpoint)) {
    const allowed = await checkRateLimit(clientIP, endpoint, env);
    if (!allowed) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please wait before trying again.'
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  try {
    if (path === '/api/chat') {
      return await handleChat(request, env);
    } else if (path === '/api/images') {
      return await handleImages(request, env);
    } else if (path === '/api/search') {
      return await handleSearch(request, env);
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  } catch (error) {
    logError(error, { path, method: request.method, ip: clientIP });
    return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}