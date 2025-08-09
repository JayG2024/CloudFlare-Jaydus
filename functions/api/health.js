// Health check endpoint

export async function onRequest(context) {
  const { env } = context;
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      api: 'operational',
      aiml: env.AIML_API_KEY ? 'configured' : 'missing_key',
      luma: env.LUMA_API_KEY ? 'configured' : 'missing_key'
    }
  };

  return new Response(JSON.stringify(health, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}