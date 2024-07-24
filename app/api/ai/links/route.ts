import { getLinks } from "@/utils/jina";
import { openai } from "@ai-sdk/openai";
import { generateText, streamObject, tool } from "ai";
import { z } from "zod";

export const maxDuration = 300;

const MAX_LINKS_PER_EXPRESSION = 3;

export async function POST(req: Request): Promise<Response> {
  try {
    const { selection, context } = await req.json();

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `Your are a SEO specialist that is tasked with improving the search engine ranking of a website.
    One technique to improve the ranking of a website is to create high-quality external links in your content.

    Given a selection of text, indentify the best anchor texts for links that would improve the search engine ranking of the website.

    You can use the getPossibleLinks tool to get a list of possible links for each expression that you think would benefit from a link in the selection.
    Choose at most 2 expressions to get possible links for.
    Expressions must be a substring of the given selection.

    Once you get the list of possible links, choose one for each expression and return the links as a JSON following this Typescript interface:

    interface Link {
      url: string;
      anchorText: string;
      title: string;
    }

    interface Answer {
      links: Link[];
    }
    `,
      prompt: `
    TEXT TO MODIFY:
    ${selection}

    FULL TEXT FOR CONTEXT:
    ${context}
    `,
      tools: {
        getPossibleLinks: tool({
          description: `A tool that returns a list of links for each one of the given expressions (expressions must be a substring of the given selection). For example, if you need possible links for the expressions "apple" and "banana", you would call this tool with the expressions ["apple", "banana"] and get back an array of links for each expression.`,
          parameters: z.object({
            expressions: z
              .array(z.string())
              .describe("A substring of the given selection")
              .max(2),
          }),
          execute: async ({ expressions }) => {
            const results = await Promise.all(
              expressions.map(async (expression) => {
                const { data } = await getLinks(expression);

                console.log({ expression });

                return {
                  expression,
                  links: data
                    .filter((_, i) => i < MAX_LINKS_PER_EXPRESSION)
                    .map(({ title, url, description }) => ({
                      title,
                      url,
                      description,
                      anchorText: expression,
                    })),
                };
              })
            );

            return results;
          },
        }),
      },
      maxToolRoundtrips: 2,
    });

    const response = await streamObject({
      model: openai("gpt-4o"),
      system: `Transform the given prompt into a JSON object`,
      schema: z.object({
        links: z.array(
          z.object({
            url: z.string(),
            anchorText: z.string(),
            title: z.string(),
          })
        ),
      }),
      prompt: text,
    });

    return response.toTextStreamResponse();
  } catch (error) {
    console.log({ error });
    return Response.json({ error }, { status: 400 });
  }
}
