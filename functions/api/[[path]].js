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
    
    // Check if AIML API key is configured
    if (!env.AIML_API_KEY) {
      return new Response(JSON.stringify({ 
        error: 'Chat service not configured',
        message: 'AIML API key is missing. Please configure AIML_API_KEY in environment variables.',
        code: 'MISSING_API_KEY'
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Sanitize inputs
    const sanitizedMessages = messages.map(msg => ({
      ...msg,
      content: sanitizeInput(msg.content)
    }));

    // Map frontend model names to AIML API model names
    // AIML API supported models (using proper model names)
    const aimlModelMap = {
      'fast': 'gpt-4o-mini',
      'smart': 'gpt-4o',
      'creative': 'gpt-4o',
      'gpt-4o-mini': 'gpt-4o-mini',
      'gpt-4o': 'gpt-4o',
      'gpt-4': 'gpt-4',
      'gpt-3.5-turbo': 'gpt-3.5-turbo'
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

    if (!aimlResponse.ok) {
      const errorData = await aimlResponse.text();
      console.error('AIML API error:', aimlResponse.status, errorData);
      
      return new Response(JSON.stringify({ 
        error: 'Chat service error',
        message: `Chat API returned ${aimlResponse.status}. Please check your API key and try again.`,
        code: 'API_ERROR'
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

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

  try {
    const { prompt, aspectRatio = '16:9', model = 'photon-flash' } = await request.json();
  
    // Sanitize inputs
    const sanitizedPrompt = sanitizeInput(prompt);

    if (!['photon-flash', 'photon-2', 'flux-1-kontext-pro', 'seedream-3-0'].includes(model)) {
      return new Response(JSON.stringify({ error: 'Invalid model' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle AIML models (Flux and SeeDream)
    if (['flux-1-kontext-pro', 'seedream-3-0'].includes(model)) {
      if (!env.AIML_API_KEY) {
        return new Response(JSON.stringify({ 
          error: 'Image service not configured',
          message: 'AIML API key is missing. Please configure AIML_API_KEY in environment variables.',
          code: 'MISSING_API_KEY'
        }), {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
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
    if (!env.LUMA_API_KEY) {
      return new Response(JSON.stringify({ 
        error: 'Image service not configured',
        message: 'LUMA API key is missing. Please configure LUMA_API_KEY in environment variables.',
        code: 'MISSING_API_KEY'
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

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
    
    // Check if required API keys are configured
    if (!env.AIML_API_KEY) {
      return new Response(JSON.stringify({ 
        error: 'Search service not configured',
        message: 'AIML API key is missing. Please configure AIML_API_KEY in environment variables.',
        code: 'MISSING_API_KEY'
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Step 1: Get real-time search results using Serper API
    let searchResults = [];
    let sources = [];
    
    // Support both SERPER_API_KEY and PERPLEXITY_API_KEY for backward compatibility
    const searchApiKey = env.SERPER_API_KEY || env.PERPLEXITY_API_KEY;
    if (searchApiKey) {
      try {
        const serperResponse = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': searchApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            q: sanitizedQuery,
            num: 5
          })
        });
        
        if (serperResponse.ok) {
          const serperData = await serperResponse.json();
          
          // Extract search results
          if (serperData.organic) {
            searchResults = serperData.organic.slice(0, 5).map(result => ({
              title: result.title,
              snippet: result.snippet,
              link: result.link
            }));
            
            sources = serperData.organic.slice(0, 3).map(result => ({
              title: result.title,
              url: result.link,
              description: result.snippet
            }));
          }
        }
      } catch (serperError) {
        console.error('Serper API error:', serperError);
        // Continue without real-time results
      }
    }
    
    // Step 2: Use ChatGPT to synthesize the search results
    const systemPrompt = `You are an advanced AI search assistant that provides comprehensive, well-researched answers by searching the web and synthesizing information from multiple sources. Your goal is to deliver accurate, up-to-date, and thoroughly cited responses.

RESPONSE STRUCTURE:
- **Direct Answer**: Start with a clear, concise answer to the user's question
- **Detailed Explanation**: Provide comprehensive context and background with inline citations [1], [2], etc.
- **Recent Developments**: Highlight any recent changes or updates when relevant
- **Additional Context**: Add relevant background information that enhances understanding

CITATION REQUIREMENTS:
- Cite factual claims with numbered references [1], [2], etc. when sources are available
- Use inline citations throughout the text, not just at the end
- When provided with search results, reference them appropriately
- Distinguish between different types of sources and their credibility

QUALITY STANDARDS:
- Verify information across multiple sources when available
- Use clear, accessible language while maintaining precision
- Structure information logically with smooth transitions
- Present multiple perspectives on controversial topics
- Acknowledge uncertainty when information is limited

Your goal is to be the most reliable, comprehensive, and transparent search assistant possible. Always prioritize accuracy and proper attribution.`;

    let contextMessage = `Search and provide comprehensive information about: ${sanitizedQuery}`;
    
    if (searchResults.length > 0) {
      contextMessage += `\n\nHere are the latest search results to help inform your response:\n\n`;
      searchResults.forEach((result, index) => {
        contextMessage += `${index + 1}. **${result.title}**\n   ${result.snippet}\n   Source: ${result.link}\n\n`;
      });
    }

    const searchResponse = await fetch('https://api.aimlapi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.AIML_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',  // Use GPT-4o for synthesis
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user', 
            content: contextMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!searchResponse.ok) {
      const errorData = await searchResponse.text();
      console.error('Search API error:', searchResponse.status, errorData);
      
      return new Response(JSON.stringify({ 
        error: 'Search service error',
        message: `Search API returned ${searchResponse.status}. Please try again.`,
        code: 'API_ERROR'
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const searchData = await searchResponse.json();
    const content = searchData.choices[0]?.message?.content || '';
    
    if (!content) {
      return new Response(JSON.stringify({ 
        error: 'No search results',
        message: 'No results found for your search query. Please try a different query.',
        code: 'NO_RESULTS'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const response = {
      query: sanitizedQuery,
      synthesizedResponse: content,
      sources: sources.length > 0 ? sources : [
        {
          title: `AI Web Search Results for "${sanitizedQuery}"`,
          url: "#",
          description: "Comprehensive search results powered by GPT-4o"
        }
      ],
      relatedQuestions: [
        `What are the latest developments in ${sanitizedQuery}?`,
        `How does ${sanitizedQuery} work?`,
        `What are the benefits of ${sanitizedQuery}?`,
        `What are the current trends regarding ${sanitizedQuery}?`
      ]
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Search error:', error);
    return new Response(JSON.stringify({ 
      error: 'Search failed',
      message: 'An unexpected error occurred during search. Please try again.',
      code: 'INTERNAL_ERROR'
    }), {
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

// Authentication handlers - Real auth integration needed
async function handleAuth(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { email, password, fullName } = await request.json();
    const url = new URL(request.url);
    const path = url.pathname;

    // Temporary demo authentication - for development access
    if (path === '/api/auth/register') {
      return new Response(JSON.stringify({
        user: { 
          id: 'demo-user-' + Date.now(),
          email: sanitizeInput(email),
          fullName: sanitizeInput(fullName),
          created: new Date().toISOString()
        },
        token: 'demo-jwt-token-' + Date.now()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else if (path === '/api/auth/login') {
      return new Response(JSON.stringify({
        user: { 
          id: 'demo-user-123',
          email: sanitizeInput(email),
          fullName: 'Demo User'
        },
        token: 'demo-jwt-token-' + Date.now()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else if (path === '/api/auth/reset-password') {
      return new Response(JSON.stringify({
        message: 'Password reset email sent successfully',
        email: sanitizeInput(email)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('Auth error:', error);
    return new Response(JSON.stringify({ 
      error: 'Authentication failed',
      message: 'Invalid request format or server error',
      code: 'AUTH_ERROR'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
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

  // Rate limiting - check specific paths that need rate limiting
  const isRateLimitedPath = path === '/api/chat' 
    || path === '/api/images' 
    || path === '/api/search' 
    || path.startsWith('/api/auth/');
  
  if (isRateLimitedPath) {
    const endpoint = path.startsWith('/api/auth/') ? 'auth' : path.split('/').pop();
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
    } else if (path.startsWith('/api/auth/')) {
      return await handleAuth(request, env);
    } else if (path === '/api/voice') {
      // Temporary stub until implemented
      if (request.method === 'POST') {
        return new Response(JSON.stringify({
          error: 'Not implemented',
          message: 'Voice synthesis is not available yet.'
        }), { status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    } else if (path === '/api/conversations' && request.method === 'GET') {
      // Minimal stub returning empty list
      return new Response(JSON.stringify({ conversations: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else if (path === '/api/conversations' && request.method === 'POST') {
      // Create and return a fake conversation id
      const id = 'conv_' + Date.now();
      return new Response(JSON.stringify({ conversationId: id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else if (/^\/api\/conversations\/.+\/messages$/.test(path) && request.method === 'POST') {
      // Accept messages for a conversation (noop)
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else if (/^\/api\/conversations\/.+$/.test(path) && request.method === 'GET') {
      // Return empty messages for a conversation
      return new Response(JSON.stringify({ conversation: { id: path.split('/').pop() }, messages: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else if (/^\/api\/conversations\/.+$/.test(path) && request.method === 'DELETE') {
      return new Response(JSON.stringify({ deleted: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
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