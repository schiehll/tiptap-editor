import { Anchor, Checkbox, Table } from "@mantine/core";
import { useState } from "react";
import { z } from "zod";

export const linkSchema = z.object({
  url: z.string(),
  anchorText: z.string(),
  title: z.string(),
});

export const linksSchema = z.object({
  links: z.array(linkSchema),
});

export type LinkType = z.infer<typeof linkSchema>;
export type LinksType = z.infer<typeof linksSchema>;

type Props = LinksType & {
  onSelectionChange: (links: LinkType[]) => void;
};

export const LinksTable = ({ links, onSelectionChange }: Props) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const rows = links.map(({ url, title, anchorText }) => {
    return (
      <Table.Tr key={url}>
        <Table.Td>
          <Checkbox
            aria-label="Select row"
            checked={selectedRows.includes(url)}
            onChange={(event) => {
              const newSlection = event.currentTarget.checked
                ? [...selectedRows, url]
                : selectedRows.filter((linkUrl) => linkUrl !== url);

              setSelectedRows(newSlection);

              onSelectionChange(
                event.currentTarget.checked
                  ? selectedRows
                      .map(
                        (linkUrl) => links.find((link) => link.url === linkUrl)!
                      )
                      .concat(links.find((link) => link.url === url)!)
                  : newSlection.length === 0
                  ? []
                  : links.filter((link) => link.url !== url)
              );
            }}
          />
        </Table.Td>
        <Table.Td className="text-xs">{anchorText}</Table.Td>
        <Table.Td>
          <Anchor className="text-xs" href={url} target="_blank">
            {title}
          </Anchor>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>
            <Checkbox
              aria-label="Select all rows"
              checked={selectedRows.length === links.length}
              onChange={(event) => {
                setSelectedRows(
                  event.currentTarget.checked ? links.map(({ url }) => url) : []
                );
                onSelectionChange(event.currentTarget.checked ? links : []);
              }}
            />
          </Table.Th>
          <Table.Th>Anchor Text</Table.Th>
          <Table.Th>URL</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};
