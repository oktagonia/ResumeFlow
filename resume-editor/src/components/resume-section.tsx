"use client";

import type React from "react";
import { useState, useRef, useCallback } from "react";
import { useDrag, useDrop, DropTargetMonitor } from "react-dnd";
import { ResumeItem } from "@/components/resume-item";
import type {
  Section,
  ResumeItem as ResumeItemType,
} from "@/components/resume-editor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronDown,
  ChevronRight,
  PlusCircle,
  GripVertical,
  Edit3,
  Trash,
  Check, // Added Check icon
  X, // Added X icon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InlineRichTextEditor } from "@/components/inline-rich-text-editor";

interface ResumeSectionProps {
  section: Section;
  index: number;
  remove: () => void;
  moveSection: (dragIndex: number, hoverIndex: number) => void;
  moveItem: (sectionId: string, dragIndex: number, hoverIndex: number) => void;
  moveBulletPoint: (
    sectionId: string,
    itemId: string,
    dragIndex: number,
    hoverIndex: number
  ) => void;
  toggleSectionStatus: (sectionId: string) => void;
  toggleSectionCollapse: (sectionId: string) => void;
  toggleItemStatus: (sectionId: string, itemId: string) => void;
  toggleItemCollapse: (sectionId: string, itemId: string) => void;
  toggleBulletStatus: (
    sectionId: string,
    itemId: string,
    bulletId: string
  ) => void;
  updateSectionTitle: (sectionId: string, newTitle: string) => void;
  updateItem: (
    sectionId: string,
    itemId: string,
    updatedItem: Partial<ResumeItemType>
  ) => void;
  updateBulletText: (
    sectionId: string,
    itemId: string,
    bulletId: string,
    newText: string
  ) => void;
  addItem: (sectionId: string) => void;
  addBulletPoint: (sectionId: string, itemId: string) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string; // Ensure type is part of DragItem if it's used, otherwise remove if only for 'section' type string literal
}

export function ResumeSection({
  section,
  index,
  remove,
  moveSection,
  moveItem,
  moveBulletPoint,
  toggleSectionStatus,
  toggleSectionCollapse,
  toggleItemStatus,
  toggleItemCollapse,
  toggleBulletStatus,
  updateSectionTitle,
  updateItem,
  updateBulletText,
  addItem,
  addBulletPoint,
}: ResumeSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null); // Ref for the main section div (drop target, preview)
  const dragHandleRef = useRef<HTMLDivElement>(null); // Ref for the drag handle

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
      moveSection(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: "section",
    item: () => ({ id: section.id, index }),
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

  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(section.title);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentTitle(section.title); // Ensure currentTitle is reset to section.title from props
    setIsEditing(true);
  };

  // This function is called when the editor loses focus (onBlur)
  const handleSaveTitle = useCallback(() => {
    if (currentTitle !== section.title) {
      // Only update if title has changed
      updateSectionTitle(section.id, currentTitle);
    }
    setIsEditing(false);
  }, [currentTitle, section.id, section.title, updateSectionTitle]);

  // This function is called by the editor on every content change
  const handleTitleChangeFromEditor = useCallback((newHtmlContent: string) => {
    setCurrentTitle(newHtmlContent);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setCurrentTitle(section.title); // Revert to original title
    setIsEditing(false);
  }, [section.title]); // Dependency: section.title

  // InlineRichTextEditor handles Esc internally to blur, which then triggers handleSaveTitle
  // No explicit handleCancelEdit is needed if blur always saves.
  // If true cancel (revert without saving) is needed, InlineRichTextEditor would need an onCancel prop.

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCollapseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSectionCollapse(section.id);
  };

  const handleAddItemClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(section.id);
  };

  return (
    <div
      ref={sectionRef} // Apply sectionRef here (drop target and preview source)
      className={cn(
        "border rounded-lg bg-white group shadow-md",
        isDragging ? "opacity-40" : "opacity-100" // Apply opacity to the whole section for visual feedback
      )}
      data-handler-id={handlerId}
    >
      <div className="flex items-center p-3 bg-gray-50 rounded-t-lg">
        <div ref={dragHandleRef} className="cursor-move mr-2">
          {" "}
          {/* Apply dragHandleRef here */}
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        <Checkbox
          checked={section.status}
          onCheckedChange={() => toggleSectionStatus(section.id)}
          onClick={handleCheckboxChange}
          className="mr-2"
        />
        <button
          onClick={handleCollapseClick}
          className="mr-2 focus:outline-none"
        >
          {section.isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <InlineRichTextEditor
              value={currentTitle}
              onChange={handleTitleChangeFromEditor}
              onBlur={handleSaveTitle} // Restore onBlur to save when editor loses focus
              placeholder="Section Title"
              className="flex-1" // Added for better layout
            />
            <Button
              size="sm"
              onClick={handleSaveTitle} // Explicit save
              className="flex items-center gap-1"
            >
              <Check className="h-4 w-4" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelEdit} // Explicit cancel
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex items-center">
            <h3
              className="flex-1"
              dangerouslySetInnerHTML={{ __html: section.title }}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditClick}
              className="opacity-0 group-hover:opacity-100 transition-opacity mr-2"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddItemClick}
          className="ml-auto"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Item
        </Button>

        <Button variant="ghost" size="sm" onClick={remove} className="ml-auto">
          <Trash className="h-4 w-4 mr-1" />
        </Button>
      </div>

      {!section.isCollapsed && (
        <div className="p-3 space-y-3">
          {section.items.map((item, itemIndex) => (
            <ResumeItem
              key={item.id}
              item={item}
              sectionId={section.id}
              index={itemIndex}
              moveItem={(dragIndex, hoverIndex) =>
                moveItem(section.id, dragIndex, hoverIndex)
              }
              moveBulletPoint={(dragIndex, hoverIndex, itemId) =>
                moveBulletPoint(section.id, itemId, dragIndex, hoverIndex)
              }
              toggleItemStatus={() => toggleItemStatus(section.id, item.id)}
              toggleItemCollapse={() => toggleItemCollapse(section.id, item.id)}
              toggleBulletStatus={(bulletId) =>
                toggleBulletStatus(section.id, item.id, bulletId)
              }
              updateItem={(updatedItem) =>
                updateItem(section.id, item.id, updatedItem)
              }
              updateBulletText={(bulletId, text) =>
                updateBulletText(section.id, item.id, bulletId, text)
              }
              addBulletPoint={() => addBulletPoint(section.id, item.id)}
            />
          ))}

          {section.items.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No items in this section. Click "Add Item" to create one.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
