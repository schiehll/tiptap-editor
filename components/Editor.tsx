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
  Link,
  PencilSimpleLine,
  Sparkle,
  Swap,
  Trash,
} from "@phosphor-icons/react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import { Markdown } from "tiptap-markdown";
import { useCompletion, experimental_useObject as useObject } from "ai/react";
import { useEffect, useState } from "react";
import {
  adjustSelectionToWholeWords,
  replaceLinks,
  Selection,
} from "@/utils/selection";
import { RequestOptions } from "ai";
import { linksSchema, LinksTable, LinksType } from "@/components/LinksTable";

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
  const [aiToolsContent, setAiToolsContent] = useState("");
  const [aiLinksContent, setAiLinksContent] = useState<LinksType | null>();

  const editor = useEditor({
    extensions: [StarterKit, Markdown, LinkExtension],
    content,
  });

  const {
    completion: aiToolsCompletion,
    complete: aiToolsComplete,
    isLoading: aiToolsIsLoading,
  } = useCompletion({
    api: "/api/ai",
  });

  useEffect(() => {
    setAiToolsContent(aiToolsCompletion);
  }, [aiToolsCompletion]);

  const {
    object: aiLinksCompletion,
    submit: aiLinksComplete,
    isLoading: aiLinksIsLoading,
  } = useObject({
    api: "/api/ai/links",
    schema: linksSchema,
  });

  useEffect(() => {
    if ((aiLinksCompletion?.links ?? [])?.length > 0) {
      setAiLinksContent(aiLinksCompletion as LinksType);
    }
  }, [aiLinksCompletion]);

  const getCurrentSelectionText = () => {
    if (!currentSelection) return;

    const text = editor!.view.state.doc.textBetween(
      currentSelection.from,
      currentSelection.to,
      " "
    );

    return text;
  };

  const getAiResponse = (
    prompt: string,
    complete: (
      prompt: string,
      options?: RequestOptions
    ) => Promise<string | null | undefined>
  ) => {
    if (!currentSelection) return;

    complete(prompt, {
      body: {
        selection: getCurrentSelectionText(),
        context: editor!.view.state.doc.textContent,
      },
    });
  };

  const resetAll = () => {
    setCurrentSelection(null);
    setAiToolsContent("");
    setAiLinksContent(null);
  };

  const hasAiToolsCompletion = aiToolsContent.length > 0;
  const hasAiLinksCompletion = (aiLinksContent?.links ?? [])?.length > 0;

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
          onClickOutside: resetAll,
          onDestroy: resetAll,
        }}
      >
        <Card withBorder p={0}>
          {hasAiToolsCompletion && (
            <div className="flex max-h-[400px]">
              <Stack gap="xs" className="w-full">
                <ScrollArea.Autosize>
                  <div className="p-4 text-xs">{aiToolsContent}</div>
                </ScrollArea.Autosize>
                {!aiToolsIsLoading && (
                  <Group justify="right" p="sm" gap="xs">
                    <Button
                      size="xs"
                      variant="default"
                      leftSection={<Trash />}
                      onClick={() => {
                        setCurrentSelection(null);
                        setAiToolsContent("");

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
                            aiToolsCompletion
                          )
                          .run();

                        setCurrentSelection(null);
                        setAiToolsContent("");
                      }}
                    >
                      Replace
                    </Button>
                  </Group>
                )}
              </Stack>
            </div>
          )}
          {hasAiLinksCompletion && (
            <LinksTable
              links={aiLinksContent?.links ?? []}
              onSelectionChange={(selectedLinks) => {
                if (!currentSelection) return;

                const currentSelectionText = getCurrentSelectionText();
                const prevSelection = {
                  from: editor!.state.selection.from,
                  to: editor!.state.selection.to,
                };

                editor!
                  .chain()
                  .insertContentAt(
                    {
                      from: currentSelection.from,
                      to: currentSelection.to,
                    },
                    replaceLinks(currentSelectionText ?? "", selectedLinks)
                  )
                  .setTextSelection(prevSelection)
                  .focus()
                  .run();
              }}
            />
          )}
          {((aiToolsIsLoading && !hasAiToolsCompletion) ||
            (aiLinksIsLoading && !hasAiLinksCompletion)) && (
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
          {!aiToolsIsLoading &&
            !hasAiToolsCompletion &&
            !aiLinksIsLoading &&
            !hasAiLinksCompletion && (
              <Group gap={0}>
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
                        getAiResponse("rewrite", aiToolsComplete);
                      }}
                    >
                      Re-write
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<Article />}
                      onClick={() => {
                        getAiResponse("shorter", aiToolsComplete);
                      }}
                    >
                      Make Shorter
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<BookOpenText />}
                      onClick={() => {
                        getAiResponse("longer", aiToolsComplete);
                      }}
                    >
                      Make Longer
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
                <Button
                  size="xs"
                  variant="transparent"
                  leftSection={<Link />}
                  onClick={() => {
                    aiLinksComplete({
                      selection: getCurrentSelectionText(),
                      context: editor!.view.state.doc.textContent,
                    });
                  }}
                >
                  External Links
                </Button>
              </Group>
            )}
        </Card>
      </BubbleMenu>
    </Container>
  );
};
