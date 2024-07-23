import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";

export const maxDuration = 300;

export async function POST(req: Request): Promise<Response> {
  const { selection, context, prompt } = await req.json();

  const messages: CoreMessage[] = [];

  switch (prompt) {
    case "rewrite":
      messages.push({
        role: "system",
        content: `You are an AI writing assistant that improves existing text. Limit your response to no more than 200 characters, but make sure to construct complete sentences.`,
      });

    case "shorter":
      messages.push({
        role: "system",
        content: `You are an AI writing assistant that shortens existing text while trying to keep the original meaning. Limit your response to no more than ${
          selection.length * 0.5
        } characters.`,
      });

    case "longer":
      messages.push({
        role: "system",
        content: `You are an AI writing assistant that lengthens existing text while trying to keep the original meaning. Limit your response to no more than ${
          selection.length * 2
        } characters.`,
      });
      break;
    default:
      return new Response("Invalid option", { status: 400 });
  }

  messages.push({
    role: "user",
    content: `
    TEXT TO MODIFY:
    ${selection}

    FULL TEXT FOR CONTEXT:
    ${context}

    CONSIDERATIONS:
    - Maintain the original meaning
    - Keep the tone and style consistent
    - Keep in mind that ONLY the EXACT selected text will be replaced, no more, no less. So the response should make sense in the context of the surrounding text
    - Try to keep the same ending punctuation when it makes sense
    `,
  });

  const result = await streamText({
    model: openai("gpt-4o"),
    messages,
  });

  return result.toAIStreamResponse();
}
