import { investigateStory } from "../../server/deepseek-server.mjs";

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
};

export default async function analyze(request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: jsonHeaders,
    });
  }

  try {
    const requestBody = await request.json();
    const result = await investigateStory(requestBody.story);

    return new Response(JSON.stringify(result.payload), {
      status: result.statusCode,
      headers: jsonHeaders,
    });
  } catch (error) {
    console.error("[Netlify analyze] Request failed", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
}
