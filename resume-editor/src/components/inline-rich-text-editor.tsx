"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bold, Italic, Underline, Link, Unlink } from "lucide-react";
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
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          execCommand("bold");
          break;
        case "i":
          e.preventDefault();
          execCommand("italic");
          break;
        case "u":
          e.preventDefault();
          execCommand("underline");
          break;
      }
    }

    // Handle Enter key to finish editing
    if (e.key === "Enter") {
      e.preventDefault();
      editorRef.current?.blur();
    }
  };

  const execCommand = (command: string, value?: string) => {
    // Focus the editor first to ensure we have a selection
    if (editorRef.current) {
      editorRef.current.focus();
    }

    document.execCommand(command, false, value);

    // Update the content after the command
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }

    // Keep focus on the editor
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const isCommandActive = (command: string): boolean => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  };

  // Use onMouseDown instead of onClick to prevent losing focus
  const handleButtonMouseDown = (e: React.MouseEvent, command: string) => {
    e.preventDefault(); // Prevent the button from taking focus
    e.stopPropagation();
    execCommand(command);
  };

  const handleLinkMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setLinkText(selection.toString());
    }
    setIsLinkDialogOpen(true);
  };

  const insertLink = () => {
    if (linkUrl) {
      if (linkText) {
        const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
        execCommand("insertHTML", linkHtml);
      } else {
        execCommand("createLink", linkUrl);
      }
    }
    setIsLinkDialogOpen(false);
    setLinkUrl("");
    setLinkText("");
  };

  const removeLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    execCommand("unlink");
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleToolbarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={cn("border rounded-md", className)}
      onClick={handleEditorClick}
    >
      {/* Compact Toolbar */}
      <div
        className="flex items-center gap-1 p-1 border-b bg-gray-50"
        onClick={handleToolbarClick}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 w-6 p-0",
            isCommandActive("bold") && "bg-gray-200"
          )}
          onMouseDown={(e) => handleButtonMouseDown(e, "bold")}
          tabIndex={-1} // Prevent button from receiving focus
        >
          <Bold className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 w-6 p-0",
            isCommandActive("italic") && "bg-gray-200"
          )}
          onMouseDown={(e) => handleButtonMouseDown(e, "italic")}
          tabIndex={-1}
        >
          <Italic className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 w-6 p-0",
            isCommandActive("underline") && "bg-gray-200"
          )}
          onMouseDown={(e) => handleButtonMouseDown(e, "underline")}
          tabIndex={-1}
        >
          <Underline className="h-3 w-3" />
        </Button>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        <Popover open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onMouseDown={handleLinkMouseDown}
              tabIndex={-1}
            >
              <Link className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-3">
              <h4 className="font-medium">Add Link</h4>
              <div className="space-y-2">
                <Input
                  placeholder="Enter URL"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Input
                  placeholder="Link text (optional)"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={insertLink}>
                  Add Link
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

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onMouseDown={removeLink}
          tabIndex={-1}
        >
          <Unlink className="h-3 w-3" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="p-2 min-h-[32px] focus:outline-none text-sm"
        onInput={handleInput}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        onClick={handleEditorClick}
        onFocus={() => {
          console.log(value);
        }}
        suppressContentEditableWarning={true}
        style={{ whiteSpace: "pre-wrap" }}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
