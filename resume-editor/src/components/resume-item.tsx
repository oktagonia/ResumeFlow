"use client";

import type React from "react";

import { useState, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { BulletPoint } from "@/components/bullet-point";
import type { ResumeItem as ResumeItemType } from "@/components/resume-editor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronRight,
  PlusCircle,
  GripVertical,
  Edit3,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InlineRichTextEditor } from "@/components/inline-rich-text-editor";

interface ResumeItemProps {
  item: ResumeItemType;
  sectionId: string;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  moveBulletPoint: (
    dragIndex: number,
    hoverIndex: number,
    itemId: string
  ) => void;
  toggleItemStatus: () => void;
  toggleItemCollapse: () => void;
  toggleBulletStatus: (bulletId: string) => void;
  updateItem: (updatedItem: Partial<ResumeItemType>) => void;
  updateBulletText: (bulletId: string, text: string, json: any) => void; // Added json parameter
  addBulletPoint: () => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export function ResumeItem({
  item,
  sectionId,
  index,
  moveItem,
  moveBulletPoint,
  toggleItemStatus,
  toggleItemCollapse,
  toggleBulletStatus,
  updateItem,
  updateBulletText,
  addBulletPoint,
}: ResumeItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop({
    accept: "item",
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
      moveItem(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: "item",
    item: () => {
      return { id: item.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;

  drag(drop(ref));

  const [isEditing, setIsEditing] = useState(false);
  // Initialize itemData with HTML and JSON from props
  const [itemData, setItemData] = useState({
    title: item.title,
    organization: item.organization,
    startDate: item.startDate,
    endDate: item.endDate,
    location: item.location,
    // Initialize with existing JSON or default empty Tiptap JSON if undefined
    titleJson: item.titleJSON || {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    organizationJson: item.organizationJSON || {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
  });

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // When entering edit mode, populate itemData with current item props, including JSON
    setItemData({
      title: item.title,
      organization: item.organization,
      startDate: item.startDate,
      endDate: item.endDate,
      location: item.location,
      titleJson: item.titleJSON || {
        type: "doc",
        content: [{ type: "paragraph" }],
      },
      organizationJson: item.organizationJSON || {
        type: "doc",
        content: [{ type: "paragraph" }],
      },
    });
    setIsEditing(true);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Pass the complete itemData (including titleJson and organizationJson) to updateItem
    updateItem(itemData);
    setIsEditing(false);
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Reset to original values from item prop, including JSON
    setItemData({
      title: item.title,
      organization: item.organization,
      startDate: item.startDate,
      endDate: item.endDate,
      location: item.location,
      titleJson: item.titleJSON || {
        type: "doc",
        content: [{ type: "paragraph" }],
      },
      organizationJson: item.organizationJSON || {
        type: "doc",
        content: [{ type: "paragraph" }],
      },
    });
    setIsEditing(false);
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const { name, value } = e.target;
    setItemData((prev) => ({ ...prev, [name]: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancelClick(e as any);
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSaveClick(e as any);
    }
  };

  const handleAddBulletClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addBulletPoint();
  };

  const handleCollapseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleItemCollapse();
  };

  return (
    <div
      ref={preview}
      className={cn(
        "border rounded-lg ml-6 shadow-md",
        isDragging ? "opacity-40" : "opacity-100"
      )}
      data-handler-id={handlerId}
    >
      <div className="flex items-center p-3 bg-gray-50 rounded-t-lg">
        <div ref={ref} className="cursor-move mr-2">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        <Checkbox
          checked={item.status}
          onCheckedChange={toggleItemStatus}
          className="mr-2"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={handleCollapseClick}
          className="mr-2 focus:outline-none"
        >
          {item.isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {isEditing ? (
          <div
            className="flex-1 space-y-2"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            <InlineRichTextEditor
              value={itemData.title}
              onChange={(
                html,
                json // Updated to receive html and json
              ) =>
                setItemData((prev) => ({
                  ...prev,
                  title: html,
                  titleJson: json,
                }))
              }
              placeholder="Position/Title"
              className="font-medium"
            />
            <div className="grid grid-cols-2 gap-2">
              <InlineRichTextEditor
                value={itemData.organization}
                onChange={(
                  html,
                  json // Updated to receive html and json
                ) =>
                  setItemData((prev) => ({
                    ...prev,
                    organization: html,
                    organizationJson: json,
                  }))
                }
                placeholder="Organization"
              />
              <Input
                name="location"
                value={itemData.location}
                onChange={handleItemChange}
                placeholder="Location"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                name="startDate"
                value={itemData.startDate}
                onChange={handleItemChange}
                placeholder="Start Date"
                onClick={(e) => e.stopPropagation()}
              />
              <Input
                name="endDate"
                value={itemData.endDate}
                onChange={handleItemChange}
                placeholder="End Date"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="flex gap-2 pt-2">
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
          <div className="flex-1">
            <h4
              className="font-medium"
              dangerouslySetInnerHTML={{ __html: item.title }}
            />
            <div className="text-sm flex justify-between">
              {item.organization && (
                <span dangerouslySetInnerHTML={{ __html: item.organization }} />
              )}
              <span>{item.location}</span>
            </div>
            {(item.startDate || item.endDate) && (
              <div className="text-sm text-gray-500">
                {item.startDate} {item.startDate && item.endDate && "–"}{" "}
                {item.endDate}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-1 ml-auto">
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditClick}
              className="opacity-0 group-hover:opacity-100"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleAddBulletClick}>
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Bullet
          </Button>
        </div>
      </div>

      {!item.isCollapsed && (
        <div className="p-3 space-y-2 group">
          {item.bulletPoints.map((bullet, bulletIndex) => (
            <BulletPoint
              key={bullet.id}
              bullet={bullet}
              itemId={item.id}
              index={bulletIndex}
              moveBulletPoint={(dragIndex, hoverIndex) =>
                moveBulletPoint(dragIndex, hoverIndex, item.id)
              }
              toggleBulletStatus={() => toggleBulletStatus(bullet.id)}
              updateBulletText={(text, json) =>
                updateBulletText(bullet.id, text, json)
              } // Pass json
            />
          ))}

          {item.bulletPoints.length === 0 && (
            <div className="text-center py-2 text-gray-500 text-sm">
              No bullet points. Click "Add Bullet" to create one.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
