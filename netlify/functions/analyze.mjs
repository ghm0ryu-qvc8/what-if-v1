import { investigateStory } from "../../server/deepseek-server.mjs";

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
};

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const requestBody = event.body ? JSON.parse(event.body) : {};
    const result = await investigateStory(requestBody.story);

    return {
      statusCode: result.statusCode,
      headers: jsonHeaders,
      body: JSON.stringify(result.payload),
    };
  } catch (error) {
    console.error("[Netlify analyze] Request failed", error);

    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
}
