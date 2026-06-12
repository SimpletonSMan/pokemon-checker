export async function onRequest(context) {
  const url = new URL(context.request.url).searchParams.get("url");

  if (!url) {
    return new Response("Missing url parameter", { status: 400 });
  }

  if (!url.startsWith("https://pokepast.es/")) {
    return new Response("URL not allowed", { status: 403 });
  }

  // Remove trailing slash and existing /raw or /download
  const baseUrl = url
    .replace(/\/$/, "")
    .replace(/\/raw$/, "")
    .replace(/\/download$/, "");

  try {
    // Fetch the downloadable text version
    const upstream = await fetch(baseUrl + "/download", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
      }
    });

    if (!upstream.ok) {
      return new Response(
        "Upstream returned: " + upstream.status,
        { status: upstream.status }
      );
    }

    const text = await upstream.text();

    return new Response(text, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (err) {
    return new Response(
      "Fetch failed: " + err.message,
      { status: 502 }
    );
  }
}
