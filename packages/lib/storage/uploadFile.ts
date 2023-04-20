import type { Env } from "../types";

export async function uploadFile(
  request: Request,
  env: Env,
  body: ArrayBuffer,
  fileName?: string
) {
  const id = fileName || Date.now().toString();
  const object = await env.R2_BUCKET.put(id, body, {
    httpMetadata: request.headers,
  });

  if (object) {
    const origin = new URL(request.url).origin;
    const url = new URL(`/v1/storage/file/${fileName}`, origin);
    return url.toString();
  }

  throw new Error("Uncaught error");
}
