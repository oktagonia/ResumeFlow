"use client";

import type React from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";

interface ResizablePanelsProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  initialLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  className?: string;
}

export function ResizablePanels({
  leftPanel,
  rightPanel,
  initialLeftWidth = 50,
  minLeftWidth = 30,
  maxLeftWidth = 70,
  className,
}: ResizablePanelsProps) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className={cn("w-full h-full", className)}
    >
      <ResizablePanel
        defaultSize={initialLeftWidth}
        minSize={minLeftWidth}
        maxSize={maxLeftWidth}
      >
        <div className="bg-white rounded-lg shadow-md h-full overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-4 pr-2">
            {leftPanel}
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle
        withHandle
        className="w-2 bg-gray-300 hover:bg-gray-400"
      />

      <ResizablePanel defaultSize={100 - initialLeftWidth}>
        <div className="bg-white rounded-lg shadow-md h-full overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-4 pr-2">
            {rightPanel}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
