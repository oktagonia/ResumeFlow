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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon, Link as LinkIcon, Unlink } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
}

export function InlineRichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
}: InlineRichTextEditorProps) {
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
        },
      }),
    ],
    content: value,
    editorProps: {
      handleKeyDown: (view, event) => {
        // Handle Enter key to finish editing (inline behavior)
        if (event.key === "Enter") {
          event.preventDefault();
          view.dom.blur();
          return true;
        }
        return false;
      },
      transformPastedHTML: (html) => {
        // Convert multi-line pasted content to single line
        return html.replace(/<\/p>\s*<p>/g, " ").replace(/<br\s*\/?>/g, " ");
      },
      attributes: {
        class: "p-2 min-h-[32px] focus:outline-none text-sm",
        "data-placeholder": placeholder || "",
        style: "white-space: pre-wrap;",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onBlur: () => {
      onBlur?.();
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  const setLink = () => {
    if (!linkUrl) return;
    
    if (editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }
    
    setIsLinkDialogOpen(false);
    setLinkUrl("");
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("border rounded-md relative", className)}>
      {/* Floating Toolbar using BubbleMenu */}
      <BubbleMenu 
        editor={editor} 
        className="flex items-center gap-1 p-1 border bg-white rounded shadow-lg"
      >
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-6 w-6 p-0", editor.isActive("bold") && "bg-gray-200")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-6 w-6 p-0", editor.isActive("italic") && "bg-gray-200")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-6 w-6 p-0", editor.isActive("underline") && "bg-gray-200")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-3 w-3" />
        </Button>
        
        <div className="w-px h-4 bg-gray-300 mx-1" />
        
        <Popover open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-6 w-6 p-0", editor.isActive("link") && "bg-gray-200")}
            >
              <LinkIcon className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
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
              <div className="flex gap-2">
                <Button size="sm" onClick={setLink}>
                  Set Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLinkDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
        >
          <Unlink className="h-3 w-3" />
        </Button>
      </BubbleMenu>

      {/* Editor */}
      <EditorContent editor={editor} />

      <style jsx>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
