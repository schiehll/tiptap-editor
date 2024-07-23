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
