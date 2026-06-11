export async function onRequest(context) {
  const url = new URL(context.request.url).searchParams.get('url');

  if (!url) return new Response('Missing url parameter', { status: 400 });

  if (!url.startsWith('https://pokepast.es/')) {
    return new Response('URL not allowed', { status: 403 });
  }

  const upstream = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  const text = await upstream.text();

  return new Response(text, {
    status: upstream.status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
