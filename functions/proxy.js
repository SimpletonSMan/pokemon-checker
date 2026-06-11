export async function onRequest(context) {
  const url = new URL(context.request.url).searchParams.get('url');

  if (!url) return new Response('Missing url parameter', { status: 400 });

  // Accept both /raw and plain paste URLs
  const baseUrl = url.replace(/\/raw$/, '').replace(/\/$/, '');

  if (!baseUrl.startsWith('https://pokepast.es/')) {
    return new Response('URL not allowed', { status: 403 });
  }

  // Fetch the regular HTML page (raw endpoint appears broken)
  const upstream = await fetch(baseUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,*/*',
      'Accept-Language': 'en-US,en;q=0.9',
    }
  });

  if (!upstream.ok) {
    return new Response('Upstream error: ' + upstream.status, { status: upstream.status });
  }

  const html = await upstream.text();

  // Extract Pokémon blocks from <pre> tags inside <code> elements
  // Pokepaste wraps each mon's text in <pre><code>...</code></pre>
  const blocks = [];
  const regex = /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    // Decode HTML entities
    const text = match[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<[^>]+>/g, '') // strip any inline tags
      .trim();
    if (text) blocks.push(text);
  }

  if (blocks.length === 0) {
    return new Response('Could not extract team from paste', { status: 422 });
  }

  // Join blocks with double newline to match Showdown paste format
  const teamText = blocks.join('\n\n');

  return new Response(teamText, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
