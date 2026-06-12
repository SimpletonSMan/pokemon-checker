export async function onRequest(context) {
  const url = new URL(context.request.url).searchParams.get("url");

  if (!url) {
    return new Response("Missing url parameter", { status: 400 });
  }

  if (!url.startsWith("https://pokepast.es/")) {
    return new Response("URL not allowed", { status: 403 });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept": "text/html"
      }
    });

    if (!upstream.ok) {
      return new Response(
        "Upstream returned: " + upstream.status,
        { status: upstream.status }
      );
    }

    const html = await upstream.text();

    // Find every <pre> block
    const blocks = [];
    const regex = /<pre[^>]*>([\s\S]*?)<\/pre>/gi;

    let match;

    while ((match = regex.exec(html)) !== null) {
      let text = match[1];

      // Remove HTML tags
      text = text.replace(/<[^>]+>/g, "");

      // Decode entities
      text = text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      text = text.trim();

      if (text) {
        blocks.push(text);
      }
    }

    if (!blocks.length) {
      return new Response(
        "No <pre> blocks found.",
        { status: 422 }
      );
    }

    return new Response(blocks.join("\n\n"), {
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
