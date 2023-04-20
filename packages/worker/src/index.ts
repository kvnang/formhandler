/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { sendEmail, getFile, handleSubmit } from "../../lib";
import { CORS_HEADERS } from "./constants";

export interface Env {
  R2_BUCKET: R2Bucket;
  D1_DATABASE: D1Database;
  API_KEY: string;
}

function isAuthenticated(request: Request, env: Env) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) return false;

  const basicAuth = authHeader.split(" ")[1];
  const apiKey = atob(basicAuth).split(":")[1];

  return apiKey === env.API_KEY;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: CORS_HEADERS,
      });
    }

    // Validate API Key in the Authorization header
    if (request.method !== "GET") {
      if (!isAuthenticated(request, env)) {
        return new Response("Unauthorized", {
          status: 401,
          headers: CORS_HEADERS,
        });
      }
    }

    const patterns = {
      "v1/email/send": new URLPattern({ pathname: "/v1/email/send" }),
      "v1/submit": new URLPattern({ pathname: "/v1/submit" }),
      "v1/storage/file/:id": new URLPattern({ pathname: "/v1/storage/:id" }),
    };

    if (patterns["v1/email/send"].test(request.url)) {
      const emailResponse = await sendEmail(request);
      const json = await emailResponse.json();

      return new Response(JSON.stringify(json), {
        status: emailResponse.status,
        headers: {
          ...CORS_HEADERS,
          "content-type": "application/json",
        },
      });
    }

    if (patterns["v1/submit"].test(request.url)) {
      const submitData = await handleSubmit(request, env);

      // Log the data to the D1
      try {
        await env.D1_DATABASE.prepare(
          `INSERT INTO submissions (id, data, timestamp) VALUES (?, ?, ?)`
        )
          .bind(crypto.randomUUID(), JSON.stringify(submitData), Date.now())
          .run();
      } catch (err) {
        console.log(`INSERT ERROR`, err);
      }

      return new Response(JSON.stringify(submitData), {
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      });
    }

    if (patterns["v1/storage/file/:id"].test(request.url)) {
      const { id } = patterns["v1/storage/file/:id"].exec(request.url)?.pathname
        .groups as {
        id: string;
      };

      if (!id) {
        return new Response("Object ID not specified in the request", {
          ...CORS_HEADERS,
          status: 404,
        });
      }

      return getFile(request, env, id);
    }

    return new Response("Invalid route");
  },
};
