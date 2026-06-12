export async function onRequest(context) {
  const url = new URL(context.request.url).searchParams.get("url");

  return new Response(
    JSON.stringify({
      url,
      method: context.request.method,
      headers: Object.fromEntries(context.request.headers)
    }, null, 2),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}
