"use client";

import { Box, Button, Card } from "@mantine/core";
import { Sparkle } from "@phosphor-icons/react";
import {
  useEditor,
  EditorContent,
  BubbleMenu,
  Editor as TipTapEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const content = `
<h2>
  How can AI help you write better?
</h2>
<p>
  AI can help you write better by providing suggestions on how to improve your writing. For example, AI can help you with grammar, spelling, punctuation, and style. 
</p>
<p>AI can also help you with more advanced writing tasks, such as generating ideas, organizing your thoughts, and improving the overall structure of your writing.</p>
<h2>
  How can AI help you write faster?
</h2>
<p>
  AI can help you write faster by automating repetitive writing tasks. For example, AI can help you with formatting, citations, and references. AI can also help you with more complex writing tasks, such as summarizing information, generating outlines, and creating drafts.
</p>
`;

const adjustSelectionToWholeWords = (editor: TipTapEditor) => {
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

export const Editor = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
  });

  return (
    <Box>
      <EditorContent
        onMouseUp={() => {
          const isEmpty = editor!.view.state.selection.empty;
          if (isEmpty) return;

          const adjustedSelection = adjustSelectionToWholeWords(editor!);
          const text = editor!.view.state.doc.textBetween(
            adjustedSelection.from,
            adjustedSelection.to,
            " "
          );
          console.log({ adjustedSelection, text });
        }}
        editor={editor}
      />
      <BubbleMenu editor={editor}>
        <Card withBorder p={0}>
          <Button size="xs" variant="transparent" leftSection={<Sparkle />}>
            AI Tools
          </Button>
        </Card>
      </BubbleMenu>
    </Box>
  );
};
