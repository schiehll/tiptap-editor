import { LinkType } from "@/components/LinksTable";
import { Editor } from "@tiptap/react";

export type Selection = {
  from: number;
  to: number;
};

export const adjustSelectionToWholeWords = (editor: Editor): Selection => {
  const { state } = editor;
  const { from, to } = state.selection;

  const doc = state.doc;
  let start = from;
  let end = to;

  const isWordChar = (char: string): boolean => /\w/.test(char);

  while (start > 0 && isWordChar(doc.textBetween(start - 1, start))) {
    start--;
  }

  while (end < doc.content.size && isWordChar(doc.textBetween(end, end + 1))) {
    end++;
  }

  return { from: start, to: end };
};

export const replaceLinks = (selectedText: string, links: LinkType[]) => {
  if (links.length === 0) {
    return selectedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
  }

  // find and remove existing markdown links that are not in the links array
  let updatedText = selectedText.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (match, text, linkUrl) => {
      if (links.some((link) => link.url === linkUrl)) {
        return match;
      }

      return text;
    }
  );

  // replace anchor texts with markdown links
  links.forEach((link) => {
    const regex = new RegExp(
      `\\b${link.anchorText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`
    );
    updatedText = updatedText.replace(
      regex,
      `[${link.anchorText}](${link.url})`
    );
  });

  return updatedText;
};
