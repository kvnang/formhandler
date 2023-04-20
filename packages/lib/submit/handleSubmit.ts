import { Env } from "../types";
import { sha1 } from "../utils";
import { uploadFile } from "..";

export async function handleSubmit(request: Request, env: Env) {
  if (request.method !== "POST") {
    return new Response("Invalid method", {
      status: 405,
    });
  }

  const formData = await request.formData();

  const object: Record<string, any> = {};
  // Loop through the data getting the values, string or file
  for (const entry of formData.entries()) {
    const key = entry[0];
    const value = entry[1] as string | File;

    if (value instanceof File) {
      const hash = await sha1(value);
      const extension = value.name.split(".").pop();
      const publicUrl = await uploadFile(
        request,
        env,
        await value.arrayBuffer(),
        hash + "." + extension
      );

      object[key] = publicUrl;
    } else {
      object[key] = value;
    }
  }

  return object;
}
