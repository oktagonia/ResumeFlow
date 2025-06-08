"use client";

import type React from "react";

import { useState } from "react";

import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
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
  Check,
  X,
  Delete,
  DeleteIcon,
  Trash,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  type: string;
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
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop({
    accept: "section",
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
    item: () => {
      return { id: section.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;

  drag(drop(ref));

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(section.title);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTitle(section.title); // Reset to current value
    setIsEditing(true);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateSectionTitle(section.id, title);
    setIsEditing(false);
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTitle(section.title); // Reset to original value
    setIsEditing(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setTitle(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveClick(e as any);
    } else if (e.key === "Escape") {
      handleCancelClick(e as any);
    }
  };

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
      ref={preview}
      className={cn(
        "border rounded-lg bg-white group shadow-md",
        isDragging ? "opacity-40" : "opacity-100"
      )}
      data-handler-id={handlerId}
    >
      <div className="flex items-center p-3 bg-gray-50 rounded-t-lg">
        <div ref={ref} className="cursor-move mr-2">
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
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              onKeyDown={handleKeyDown}
              className="font-semibold bg-white border rounded px-2 py-1 flex-1"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
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
          </div>
        ) : (
          <div className="flex-1 flex items-center">
            <h3 className="font-semibold flex-1">{section.title}</h3>
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
