import type { Env } from "../types";

export async function getFile(request: Request, env: Env, id: string) {
  if (request.method !== "GET") {
    return new Response("Invalid method", {
      status: 405,
    });
  }

  const object = await env.R2_BUCKET.get(id);

  // If object is not available on R2, try fetching object from S3
  if (!object) {
    return new Response("No object found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  return new Response(object.body, { headers });
}
