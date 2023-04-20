import { MailchannelsBody } from "../types";

export async function sendEmail(request: Request) {
  if (request.method !== "POST") {
    return new Response("Invalid method", {
      status: 405,
    });
  }

  const searchParams = new URL(request.url).searchParams;
  const body = (await request.json()) as MailchannelsBody;

  // to and from are objects with email and name properties
  const endpoint = new URL(`https://api.mailchannels.net/tx/v1/send`);

  if (searchParams.get("dry-run") === "true") {
    endpoint.searchParams.set("dry-run", "true");
  }

  const sendRequest = new Request(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  try {
    const sendResponse = await fetch(sendRequest);
    // const sendResponseJson = await sendResponse.json();

    return sendResponse;
  } catch (e) {
    return new Response(JSON.stringify(e), {
      status: 500,
    });
  }
}
