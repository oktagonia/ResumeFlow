"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";

const Tiptap = () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text],
    content: "<p>Hello World! 🌎️</p>",
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 min-h-[400px]">
        <EditorContent
          editor={editor}
          className="prose prose-lg max-w-none focus:outline-none [&_p:not(:first-child)]:hidden"
        />
      </div>
    </div>
  );
};

export default Tiptap;
