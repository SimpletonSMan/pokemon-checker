export async function onRequest(context) {
  const url = new URL(context.request.url).searchParams.get("url");

  if (!url) {
    return new Response("Missing url parameter", { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const text = await upstream.text();

    return new Response(
      JSON.stringify({
        status: upstream.status,
        ok: upstream.ok,
        first1000: text.substring(0, 1000)
      }, null, 2),
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err.toString()
      }, null, 2),
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}
