"use client";

import type React from "react";

import { useState, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import type { BulletPoint as BulletPointType } from "@/components/resume-editor";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/rich-text-editor";
import { GripVertical, Edit3, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulletPointProps {
  bullet: BulletPointType;
  itemId: string;
  index: number;
  moveBulletPoint: (dragIndex: number, hoverIndex: number) => void;
  toggleBulletStatus: () => void;
  updateBulletText: (text: string, json: any) => void; // Changed to include json
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export function BulletPoint({
  bullet,
  itemId,
  index,
  moveBulletPoint,
  toggleBulletStatus,
  updateBulletText,
}: BulletPointProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop({
    accept: "bullet",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveBulletPoint(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: "bullet",
    item: () => {
      return { id: bullet.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;

  drag(drop(ref));

  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(bullet.text); // HTML content
  const [json, setJson] = useState(
    bullet.json || { type: "doc", content: [{ type: "paragraph" }] }
  ); // Tiptap JSON content

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setText(bullet.text); // Reset HTML to current value
    setJson(bullet.json || { type: "doc", content: [{ type: "paragraph" }] }); // Reset JSON to current value or default
    setIsEditing(true);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateBulletText(text, json); // Pass both HTML and JSON
    setIsEditing(false);
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setText(bullet.text); // Reset HTML to original value
    setJson(bullet.json || { type: "doc", content: [{ type: "paragraph" }] }); // Reset JSON to original value or default
    setIsEditing(false);
  };

  const handleTextChange = (newText: string, newJson: any) => {
    // Changed to accept HTML and JSON
    setText(newText);
    setJson(newJson);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancelClick(e as any);
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSaveClick(e as any);
    }
  };

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={preview}
      className={cn(
        "flex items-center ml-6 group",
        isDragging ? "opacity-40" : "opacity-100"
      )}
      data-handler-id={handlerId}
    >
      <div
        ref={ref}
        className="cursor-move mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      <Checkbox
        checked={bullet.status}
        onCheckedChange={toggleBulletStatus}
        onClick={handleCheckboxChange}
        className="mr-2"
      />
      {isEditing ? (
        <div className="flex-1 space-y-2" onKeyDown={handleKeyDown}>
          <RichTextEditor
            value={text}
            onChange={handleTextChange}
            placeholder="Enter bullet point text..."
            className="w-full"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSaveClick}
              className="flex items-center gap-1"
            >
              <Check className="h-3 w-3" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelClick}
              className="flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Cancel
            </Button>
            <span className="text-xs text-gray-500 flex items-center ml-2">
              Ctrl+Enter to save, Esc to cancel
            </span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center group">
          <div
            className="flex-1 py-1"
            dangerouslySetInnerHTML={{ __html: bullet.text }}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditClick}
            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
          >
            <Edit3 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
