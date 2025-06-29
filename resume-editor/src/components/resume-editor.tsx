"use client";

import { useState, useEffect, useCallback, useRef } from "react"; // Added useEffect and useRef
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ResumeSection } from "@/components/resume-section";
import { ResumeLaTeX } from "@/components/resume-latex";
import { Button } from "@/components/ui/button";
import { PlusCircle, Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ResizablePanels } from "@/components/resizable-panels";
import { apiUrl } from "@/config/api";
import { useResume } from "@/hooks/useResume";
import type { BulletPoint, ResumeItem, Section, Resume } from "@/types/resume";

export default function ResumeEditor() {
  const {
    resume,
    addSection,
    addLaTeX,
    addItem,
    addBulletPoint,
    removeSection,
    removeItem,
    removeBulletPoint,
    updateLatexContent,
    toggleSectionStatus,
    toggleItemStatus,
    toggleBulletStatus,
    updateSectionTitle,
    updateItem,
    updateBulletText,
    moveSection,
    moveItem,
    moveBulletPoint,
    importResume,
  } = useResume();
  // Ref for hidden file input used by Import button
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sections, setSections] = useState<Section[]>(resume.sections);
  const [loading, setLoading] = useState(false); // keep loading for fetchSections only
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Export resume JSON
  const exportJSON = () => {
    const dataStr = JSON.stringify(resume, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle JSON file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result as string;
          importResume(text);
          toast({ title: "Resume imported" });
        } catch {
          toast({ title: "Invalid JSON file", variant: "destructive" });
        }
      };
      reader.readAsText(file);
    }
    // Reset input
    e.target.value = "";
  };

  // after state initialization, sync local `sections` with hook data
  useEffect(() => {
    setSections(resume.sections);
  }, [resume.sections]);

  // Toggle section collapse
  const toggleSectionCollapse = (sectionId: string) => {
    setSections((prevSections) => {
      return prevSections.map((section) => {
        if (section.id === sectionId) {
          return { ...section, isCollapsed: !section.isCollapsed };
        }
        return section;
      });
    });
  };

  // Toggle item collapse
  const toggleItemCollapse = (sectionId: string, itemId: string) => {
    setSections((prevSections) => {
      return prevSections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map((item) => {
              if (item.id === itemId) {
                return { ...item, isCollapsed: !item.isCollapsed };
              }
              return item;
            }),
          };
        }
        return section;
      });
    });
  };

  // Generate PDF
  const generatePDF = useCallback(async () => {
    try {
      // Create a unique URL with timestamp to prevent caching
      const response = await fetch(apiUrl("pdf"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections_json: resume.sections }),
      });

      if (!response.ok) throw new Error("Failed to generate pdf");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      toast({ title: "PDF generated" });
    } catch (error) {
      toast({ title: "Error generating PDF", variant: "destructive" });
    }
  }, [toast, resume.sections]);

  return (
    <ResizablePanels
      initialLeftWidth={45}
      minLeftWidth={30}
      maxLeftWidth={70}
      className="h-screen overflow-hidden"
      leftPanel={
        <div className="h-full flex flex-col">
          <div className="flex justify-between mb-2">
            <Button size="sm" onClick={generatePDF}>
              Generate PDF
            </Button>
            {pdfUrl && (
              <Button size="sm" asChild>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  Open PDF
                </a>
              </Button>
            )}
          </div>
          {pdfUrl ? (
            <div className="flex flex-col h-full">
              <iframe
                src={pdfUrl}
                className="w-full flex-1 border rounded"
                title="Resume PDF"
                onLoad={() => console.log("PDF iframe loaded")}
                onError={() => console.log("PDF iframe error")}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              Click "Generate PDF" to preview your resume
            </div>
          )}
        </div>
      }
      rightPanel={
        <div className="h-full flex flex-col">
          <div className="flex flex-shrink-0 justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Resume Content</h2>
            <div className="flex gap-2">
              <Button onClick={addSection}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Section
              </Button>
              <Button onClick={addLaTeX}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add LaTeX
              </Button>
              <Button size="sm" onClick={exportJSON}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              {/* Hidden file input for import */}
              <input
                type="file"
                accept="application/json"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <DndProvider backend={HTML5Backend}>
              <div className="space-y-4">
                {sections.map((section, index) => {
                  if (section.type === "LaTeX") {
                    return (
                      <ResumeLaTeX
                        key={section.id}
                        id={section.id}
                        index={index}
                        moveLatex={moveSection}
                        remove={() => removeSection(section.id)}
                        latex={{
                          id: section.id,
                          type: "LaTeX",
                          title: section.title,
                          content: (section.json as string) || "", // Render JSON content
                          isCollapsed: section.isCollapsed,
                          status: section.status,
                        }}
                        toggleLatexCollapse={() =>
                          toggleSectionCollapse(section.id)
                        }
                        toggleLatexStatus={() =>
                          toggleSectionStatus(section.id)
                        }
                        updateLatexContent={(id, content) =>
                          updateLatexContent(id, content)
                        }
                      />
                    );
                  }

                  return (
                    <ResumeSection
                      key={section.id}
                      section={section}
                      index={index}
                      remove={() => removeSection(section.id)}
                      moveSection={moveSection}
                      moveItem={moveItem}
                      moveBulletPoint={moveBulletPoint}
                      toggleSectionStatus={toggleSectionStatus}
                      toggleSectionCollapse={toggleSectionCollapse}
                      toggleItemStatus={toggleItemStatus}
                      toggleItemCollapse={toggleItemCollapse}
                      toggleBulletStatus={toggleBulletStatus}
                      updateSectionTitle={updateSectionTitle}
                      updateItem={updateItem}
                      updateBulletText={updateBulletText}
                      addItem={addItem}
                      addBulletPoint={addBulletPoint}
                    />
                  );
                })}
              </div>
            </DndProvider>
          </div>
        </div>
      }
    />
  );
}
