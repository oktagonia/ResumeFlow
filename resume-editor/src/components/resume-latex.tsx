"use client";

import type React from "react";
import { useRef, useState } from "react";
import { useDrag, useDrop, DropTargetMonitor } from "react-dnd";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Trash,
  Edit,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumeLatexProps {
  id: string;
  index: number;
  moveLatex: (dragIndex: number, hoverIndex: number) => void;
  remove: () => void;
  toggleLatexCollapse: (id: string) => void;
  toggleLatexStatus?: (id: string) => void; // Added status toggle prop
  updateLatexContent?: (id: string, content: string) => void; // Added content update prop
  latex: {
    id: string;
    type: "LaTeX";
    title: string;
    content: string;
    isCollapsed: boolean;
    status?: boolean; // Added status field
  };
}

interface DragItem {
  index: number;
  id: string;
  type: string; // Ensure type is part of DragItem if it's used, otherwise remove if only for 'section' type string literal
}

export function ResumeLaTeX({
  id,
  index,
  moveLatex,
  remove,
  toggleLatexCollapse,
  toggleLatexStatus,
  updateLatexContent,
  latex,
}: ResumeLatexProps) {
  const sectionRef = useRef<HTMLDivElement>(null); // Ref for the main section div (drop target, preview)
  const dragHandleRef = useRef<HTMLDivElement>(null); // Ref for the drag handle
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(latex.content);

  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: string | symbol | null }
  >({
    accept: "section",
    collect(monitor: DropTargetMonitor<DragItem, void>) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor: DropTargetMonitor<DragItem, void>) {
      if (!sectionRef.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = sectionRef.current?.getBoundingClientRect(); // Use sectionRef

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
      moveLatex(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: "section",
    item: () => ({ id, index }),
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;

  // Connect refs:
  // - drag source to the handle
  // - drop target to the main section div
  // - preview to the main section div
  drag(dragHandleRef);
  drop(sectionRef);
  preview(sectionRef);

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleContentUpdate = () => {
    // Update content locally
    latex.content = editContent;
    // Also update content in parent component if function is provided
    if (updateLatexContent) {
      updateLatexContent(latex.id, editContent);
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={sectionRef}
      className={cn(
        "border rounded-lg bg-white group shadow-md",
        isDragging ? "opacity-40" : "opacity-100"
      )}
      data-handler-id={handlerId}
    >
      <div className="flex items-center p-3 bg-gray-50 rounded-t-lg">
        <div ref={dragHandleRef} className="cursor-move mr-2">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        <Checkbox
          checked={latex.status}
          onCheckedChange={() => toggleLatexStatus?.(latex.id)}
          onClick={handleCheckboxChange}
          className="mr-2"
        />
        <button
          onClick={() => toggleLatexCollapse(latex.id)}
          className="mr-2 focus:outline-none"
        >
          {latex.isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        <div className="flex-1 flex items-center">
          <h3 className="flex-1">LaTeX</h3>
        </div>

        {isEditing ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleContentUpdate}
              className="flex items-center gap-1"
            >
              <Check className="h-4 w-4" />
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditContent(latex.content);
                setIsEditing(false);
              }}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditContent(latex.content);
              setIsEditing(true);
            }}
            className="flex items-center gap-1 mr-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        )}

        <Button variant="ghost" size="sm" onClick={remove} className="">
          <Trash className="h-4 w-4" />
        </Button>
      </div>

      {!latex.isCollapsed && (
        <div className="p-3">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                className="w-full h-32 p-2 bg-gray-100 rounded font-mono text-sm border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="\\LaTeX content goes here"
              />
            </div>
          ) : (
            <div className="bg-gray-100 p-2 rounded font-mono text-sm">
              {latex.content || "\\LaTeX content goes here"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
