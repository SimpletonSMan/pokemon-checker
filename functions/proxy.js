export async function onRequest(context) {
  const url = new URL(context.request.url).searchParams.get("url");

  if (!url) {
    return new Response("Missing url parameter", { status: 400 });
  }

  try {
    const baseUrl = url
      .replace(/\/$/, "")
      .replace(/\/raw$/, "")
      .replace(/\/download$/, "");

    const target = baseUrl + "/download";

    const upstream = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const text = await upstream.text();

    return new Response(
      JSON.stringify({
        target,
        status: upstream.status,
        ok: upstream.ok,
        first500: text.substring(0, 500)
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
