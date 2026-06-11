export async function onRequest(context) {
  const url = new URL(context.request.url).searchParams.get('url');

  if (!url) return new Response('Missing url parameter', { status: 400 });

  if (!url.startsWith('https://pokepast.es/')) {
    return new Response('URL not allowed', { status: 403 });
  }

  const baseUrl = url.replace(/\/raw$/, '').replace(/\/$/, '');

  let upstream;
  try {
    upstream = await fetch(baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
  } catch (err) {
    return new Response('Fetch failed: ' + err.message, { status: 502 });
  }

  if (!upstream.ok) {
    return new Response('Upstream returned: ' + upstream.status, { status: upstream.status });
  }

  const html = await upstream.text();

  // Extract text from <pre> blocks
  const blocks = [];
  const regex = /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<[^>]+>/g, '')
      .trim();
    if (text) blocks.push(text);
  }

  if (blocks.length === 0) {
    // Return raw HTML length as debug info so we can see if the page loaded
    return new Response('No blocks found. HTML length: ' + html.length + '\nFirst 500 chars:\n' + html.substring(0, 500), { status: 422 });
  }

  return new Response(blocks.join('\n\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
