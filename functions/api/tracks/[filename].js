export async function onRequestGet(context) {
  const { filename } = context.params;
  const bucket = context.env.AUDIO_BUCKET;
  if (!bucket) {
    return new Response("R2 Bucket not found", { status: 500 });
  }

  const file = await bucket.get(filename);
  if (!file) {
    return new Response("File not found", { status: 404 });
  }

  const headers = new Headers();
  file.writeHttpMetadata(headers);
  headers.set('etag', file.httpEtag);
  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(file.body, {
    headers
  });
}
