export const getLinks = async (
  expression: string
): Promise<{
  code: number;
  status: number;
  data: {
    title: string;
    url: string;
    content: string;
    description: string;
  }[];
}> => {
  const response = await fetch(`https://s.jina.ai/${encodeURI(expression)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.JINA_API_KEY}`,
      Accept: "application/json",
    },
  });

  const json = await response.json();
  console.log({ json });
  return json;
};
