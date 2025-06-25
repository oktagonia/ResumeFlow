"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string, json: any) => void; // Changed to include json
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
}: RichTextEditorProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
          class: "text-blue-600 underline cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Start typing...",
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "p-3 min-h-[40px] focus:outline-none",
      },
      handleKeyDown: (view, event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getJSON()); // Pass both HTML and JSON
    },
    onBlur: () => {
      onBlur?.();
    },
    onCreate: ({ editor }) => {
      // Ensure single line on create
      const doc = editor.state.doc;
      if (doc.childCount > 1) {
        const content = doc.textContent;
        editor.commands.setContent(`<p>${content}</p>`);
      }
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  const handleLinkClick = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    setLinkUrl(previousUrl || "");
    setIsLinkDialogOpen(true);
  };

  const setLink = () => {
    if (!editor) return;

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }

    setIsLinkDialogOpen(false);
    setLinkUrl("");
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("border rounded-md relative", className)}>
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex items-center gap-1 p-2 bg-white border border-gray-300 rounded-lg shadow-lg"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive("bold") && "bg-gray-200"
            )}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <BoldIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive("italic") && "bg-gray-200"
            )}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <ItalicIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive("underline") && "bg-gray-200"
            )}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Popover open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  editor.isActive("link") && "bg-gray-200"
                )}
                onClick={handleLinkClick}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <h4 className="font-medium">Add Link</h4>
                <div className="space-y-2">
                  <Input
                    placeholder="Enter URL"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setLink();
                      }
                    }}
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={setLink}>
                    {linkUrl ? "Update Link" : "Add Link"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsLinkDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {editor.isActive("link") && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().unsetLink().run()}
            >
              <Unlink className="h-4 w-4" />
            </Button>
          )}
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
