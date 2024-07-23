"use client";

import {
  Button,
  Card,
  Container,
  Group,
  Loader,
  Menu,
  ScrollArea,
  Stack,
} from "@mantine/core";
import {
  Article,
  BookOpenText,
  PencilSimpleLine,
  Sparkle,
  Swap,
  Trash,
} from "@phosphor-icons/react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCompletion } from "ai/react";
import { useEffect, useState } from "react";
import { adjustSelectionToWholeWords, Selection } from "@/utils/selection";

const content = `
<h2>
  How can AI help you write better?
</h2>
<p>
  AI can help you write better by providing suggestions on how to improve your writing. For example, AI can help you with grammar, spelling, punctuation, and style. 
</p>
<p>AI can also help you with more advanced writing tasks, such as generating ideas, organizing your thoughts, and improving the overall structure of your writing.</p>
`;

export const Editor = () => {
  const [currentSelection, setCurrentSelection] = useState<Selection | null>();
  const [aiContent, setAiContent] = useState("");

  const editor = useEditor({
    extensions: [StarterKit],
    content,
  });

  const { completion, complete, isLoading } = useCompletion({
    api: "/api/ai",
    onError: (e) => {
      // TODO: Handle errors
      console.log(e);
    },
  });

  useEffect(() => {
    setAiContent(completion);
  }, [completion]);

  const getCurrentSelectionText = () => {
    if (!currentSelection) return;

    const text = editor!.view.state.doc.textBetween(
      currentSelection.from,
      currentSelection.to,
      " "
    );

    return text;
  };

  const getAiResponse = (prompt: string) => {
    if (!currentSelection) return;

    complete(prompt, {
      body: {
        selection: getCurrentSelectionText(),
        context: editor!.view.state.doc.textContent,
      },
    });
  };

  const hasCompletion = aiContent.length > 0;

  return (
    <Container size="sm">
      <EditorContent
        onMouseUp={() => {
          const isEmpty = editor!.view.state.selection.empty;
          if (isEmpty) return;

          const adjustedSelection = adjustSelectionToWholeWords(editor!);

          setCurrentSelection(adjustedSelection);
        }}
        editor={editor}
      />
      <BubbleMenu
        editor={editor}
        tippyOptions={{
          placement: "auto",
          onDestroy: () => {
            setCurrentSelection(null);
            setAiContent("");
          },
        }}
      >
        <Card withBorder p={0}>
          {hasCompletion && (
            <div className="flex max-h-[400px]">
              <Stack gap="xs" className="w-full">
                <ScrollArea.Autosize>
                  <div className="p-4 text-xs">{aiContent}</div>
                </ScrollArea.Autosize>
                {!isLoading && (
                  <Group justify="right" p="sm" gap="xs">
                    <Button
                      size="xs"
                      variant="default"
                      leftSection={<Trash />}
                      onClick={() => {
                        setCurrentSelection(null);
                        setAiContent("");

                        editor!.commands.selectTextblockEnd();
                        editor!.commands.blur();
                      }}
                    >
                      Discard
                    </Button>
                    <Button
                      size="xs"
                      leftSection={<Swap />}
                      onClick={() => {
                        if (!currentSelection) return;

                        editor!
                          .chain()
                          .focus()
                          .insertContentAt(
                            {
                              from: currentSelection.from,
                              to: currentSelection.to,
                            },
                            completion
                          )
                          .run();

                        setCurrentSelection(null);
                        setAiContent("");
                      }}
                    >
                      Replace
                    </Button>
                  </Group>
                )}
              </Stack>
            </div>
          )}
          {isLoading && !hasCompletion && (
            <Group
              className="h-12 w-full px-4 text-xs font-medium text-blue-600"
              justify="space-between"
              align="center"
            >
              <Group gap="xs">
                <Sparkle className="mr-2 h-4 w-4 shrink-0" />
                AI is thinking
              </Group>
              <Loader size="xs" />
            </Group>
          )}
          {!isLoading && !hasCompletion && (
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button
                  size="xs"
                  variant="transparent"
                  leftSection={<Sparkle />}
                >
                  AI Tools
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<PencilSimpleLine />}
                  onClick={() => {
                    getAiResponse("rewrite");
                  }}
                >
                  Re-write
                </Menu.Item>
                <Menu.Item
                  leftSection={<Article />}
                  onClick={() => {
                    getAiResponse("shorter");
                  }}
                >
                  Make Shorter
                </Menu.Item>
                <Menu.Item
                  leftSection={<BookOpenText />}
                  onClick={() => {
                    getAiResponse("longer");
                  }}
                >
                  Make Longer
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Card>
      </BubbleMenu>
    </Container>
  );
};
