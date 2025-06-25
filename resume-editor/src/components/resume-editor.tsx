"use client";

import { useState, useEffect, useCallback } from "react"; // Added useEffect
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ResumeSection } from "@/components/resume-section";
import { ResumeLaTeX } from "@/components/resume-latex";
import { Button } from "@/components/ui/button";
import { PlusCircle, Save, FileDown, Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ResizablePanels } from "@/components/resizable-panels";
import { apiUrl } from "@/config/api";

// Define the types for our hierarchical structure
export interface BulletPoint {
  type: "Bullet";
  id: string;
  text: string;
  status: boolean;
  json: any;
}

export interface ResumeItem {
  type: "Item";
  id: string;
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  location: string;
  status: boolean;
  isCollapsed: boolean;
  titleJSON: any;
  organizationJSON: any;
  bulletPoints: BulletPoint[];
}

export interface Section {
  type: "Section" | "LaTeX";
  id: string;
  title: string;
  status: boolean;
  isCollapsed: boolean;
  json: any;
  items: ResumeItem[];
}

export type ResumeBlock = Section; // Updated ResumeBlock type

export default function ResumeEditor() {
  const [sections, setSections] = useState<Section[]>([]); // Updated sections state type
  const [loading, setLoading] = useState(false); // Keep loading state for UI feedback
  const [pdfUrl, setPdfUrl] = useState<string | null>(null); // State for PDF URL
  const { toast } = useToast();

  useEffect(() => {
    const fetchSections = async () => {
      setLoading(true);
      try {
        const response = await fetch(apiUrl("sections"));
        if (!response.ok) {
          throw new Error("Failed to fetch sections");
        }
        const data = await response.json();
        if (data && Array.isArray(data.sections)) {
          setSections(data.sections);
          toast({
            title: "Sections loaded",
            description: "Resume data has been loaded successfully.",
          });
        } else {
          console.error(
            "Fetched sections data is not in the expected array format:",
            data
          );
          setSections([]);
          toast({
            title: "Error loading sections",
            description: "Received resume data in an unexpected format.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching sections:", error);
        toast({
          title: "Error loading sections",
          description:
            "There was a problem loading resume data. Please try again or check the backend.",
          variant: "destructive",
        });
        setSections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, [toast]); // Added toast to dependency array as it's used inside useEffect

  // Function to move sections
  const moveSection = (dragIndex: number, hoverIndex: number) => {
    const draggedSection = sections[dragIndex];
    const newSections = [...sections];
    newSections.splice(dragIndex, 1);
    newSections.splice(hoverIndex, 0, draggedSection);
    setSections(newSections);
  };

  // Function to move items within a section
  const moveItem = (
    sectionId: string,
    dragIndex: number,
    hoverIndex: number
  ) => {
    setSections((prevSections) => {
      return prevSections.map((section) => {
        if (section.id === sectionId) {
          const newItems = [...section.items];
          const draggedItem = newItems[dragIndex];
          newItems.splice(dragIndex, 1);
          newItems.splice(hoverIndex, 0, draggedItem);
          return { ...section, items: newItems };
        }
        return section;
      });
    });
  };

  // Function to move bullet points within an item
  const moveBulletPoint = (
    sectionId: string,
    itemId: string,
    dragIndex: number,
    hoverIndex: number
  ) => {
    setSections((prevSections) => {
      return prevSections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map((item) => {
              if (item.id === itemId) {
                const newBulletPoints = [...item.bulletPoints];
                const draggedBullet = newBulletPoints[dragIndex];
                newBulletPoints.splice(dragIndex, 1);
                newBulletPoints.splice(hoverIndex, 0, draggedBullet);
                return { ...item, bulletPoints: newBulletPoints };
              }
              return item;
            }),
          };
        }
        return section;
      });
    });
  };

  // Toggle section visibility
  const toggleSectionStatus = async (sectionId: string) => {
    try {
      const response = await fetch(apiUrl(`sections/${sectionId}/status`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to toggle section status");
      }

      const data = await response.json();

      setSections((prevSections) =>
        prevSections.map((section) => {
          if (section.id === sectionId) {
            return { ...section, status: data.section.status };
          }
          return section;
        })
      );

      toast({
        title: "Section status updated",
        description: "Section status has been updated successfully.",
      });
    } catch (error) {
      console.error("Error toggling section status:", error);
      toast({
        title: "Error updating section status",
        description:
          "There was a problem updating the section status. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  // Toggle item visibility
  const toggleItemStatus = async (sectionId: string, itemId: string) => {
    try {
      const response = await fetch(
        apiUrl(`sections/${sectionId}/items/${itemId}/status`),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to toggle item status");
      }

      const data = await response.json();

      setSections((prevSections) =>
        prevSections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              items: section.items.map((item) => {
                if (item.id === itemId) {
                  return { ...item, status: data.item.status };
                }
                return item;
              }),
            };
          }
          return section;
        })
      );

      toast({
        title: "Item status updated",
        description: "Item status has been updated successfully.",
      });
    } catch (error) {
      console.error("Error toggling item status:", error);
      toast({
        title: "Error updating item status",
        description:
          "There was a problem updating the item status. Please try again.",
        variant: "destructive",
      });
    }
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

  // Toggle bullet point visibility
  const toggleBulletStatus = async (
    sectionId: string,
    itemId: string,
    bulletId: string
  ) => {
    try {
      const response = await fetch(
        apiUrl(
          `sections/${sectionId}/items/${itemId}/bullets/${bulletId}/status`
        ),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to toggle bullet point status");
      }

      const data = await response.json();

      setSections((prevSections) =>
        prevSections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              items: section.items.map((item) => {
                if (item.id === itemId) {
                  return {
                    ...item,
                    bulletPoints: item.bulletPoints.map((bullet) => {
                      if (bullet.id === bulletId) {
                        return { ...bullet, status: data.bullet.status };
                      }
                      return bullet;
                    }),
                  };
                }
                return item;
              }),
            };
          }
          return section;
        })
      );

      toast({
        title: "Bullet point status updated",
        description: "Bullet point status has been updated successfully.",
      });
    } catch (error) {
      console.error("Error toggling bullet point status:", error);
      toast({
        title: "Error updating bullet point status",
        description:
          "There was a problem updating the bullet point status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update section title via API
  const updateSectionTitle = async (
    sectionId: string,
    newTitle: string,
    newJson: any
  ) => {
    try {
      const response = await fetch(apiUrl(`sections/${sectionId}/title`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, json: newJson }), // Send both title and json to the backend
      });
      if (!response.ok) {
        throw new Error("Failed to update section title");
      }
      const data = await response.json(); // Backend responds with the updated section (which might only have the title updated on the backend side)
      setSections((prevSections) =>
        prevSections.map((section) =>
          section.id === sectionId
            ? { ...section, title: data.section.title, json: newJson } // Update title from backend response, and json from frontend editor state
            : section
        )
      );
      toast({
        title: "Section title updated",
        description: "Section title has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating section title:", error);
      toast({
        title: "Error updating section title",
        description:
          "There was a problem updating the section title. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update item details
  const updateItem = async (
    sectionId: string,
    itemId: string,
    updatedItem: Partial<ResumeItem>
  ) => {
    try {
      // Send all fields including JSON data to the backend
      const response = await fetch(
        apiUrl(`sections/${sectionId}/items/${itemId}`),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedItem), // Send all fields including JSON
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update item");
      }
      const data = await response.json(); // Backend responds with the updated item (HTML fields)
      setSections((prevSections) => {
        return prevSections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              items: section.items.map((item) => {
                if (item.id === itemId) {
                  // Update item with HTML from backend and JSON from the original updatedItem argument
                  return {
                    ...item,
                    ...data.item, // HTML fields from backend response
                    titleJSON: updatedItem.titleJSON, // JSON from editor state
                    organizationJSON: updatedItem.organizationJSON, // JSON from editor state
                  };
                }
                return item;
              }),
            };
          }
          return section;
        });
      });
      toast({
        title: "Item updated",
        description: "Item details have been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error updating item",
        description: "There was a problem updating the item. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update bullet point text
  const updateBulletText = async (
    sectionId: string,
    itemId: string,
    bulletId: string,
    newText: string,
    newJson: any
  ) => {
    try {
      const response = await fetch(
        apiUrl(
          `sections/${sectionId}/items/${itemId}/bullets/${bulletId}/text`
        ),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: newText, json: newJson }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update bullet point text");
      }
      const data = await response.json(); // Expecting { bullet: { id, text, status, type } }
      setSections((prevSections) =>
        prevSections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              items: section.items.map((item) => {
                if (item.id === itemId) {
                  return {
                    ...item,
                    bulletPoints: item.bulletPoints.map((bullet) =>
                      bullet.id === bulletId
                        ? { ...bullet, text: data.bullet.text, json: newJson } // Update text from backend, json from editor
                        : bullet
                    ),
                  };
                }
                return item;
              }),
            };
          }
          return section;
        })
      );
      toast({
        title: "Bullet point updated",
        description: "Bullet point text has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating bullet point text:", error);
      toast({
        title: "Error updating bullet point text",
        description:
          "There was a problem updating the bullet point text. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add a new section
  const addSection = async () => {
    try {
      const response = await fetch(apiUrl("sections/add-section"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to add section");
      }

      const data = await response.json();
      setSections([...sections, data.section]);

      toast({
        title: "Section added",
        description: "New section has been added successfully.",
      });
    } catch (error) {
      console.error("Error adding section:", error);
      toast({
        title: "Error adding section",
        description:
          "There was a problem adding the section. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add a new LaTeX section
  const addLaTeX = async () => {
    try {
      const response = await fetch(apiUrl("sections/add-latex"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to add LaTeX section");
      }

      const data = await response.json();
      setSections([...sections, data.section]);

      toast({
        title: "LaTeX section added",
        description: "New LaTeX section has been added successfully.",
      });
    } catch (error) {
      console.error("Error adding LaTeX section:", error);
      toast({
        title: "Error adding LaTeX section",
        description:
          "There was a problem adding the LaTeX section. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeSection = async (id: string) => {
    try {
      const response = await fetch(apiUrl(`sections/${id}`), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete section");
      }

      setSections((sections) => sections.filter((sec) => sec.id !== id));
      toast({ title: "Section deleted successfully" });
    } catch (error) {
      console.error("Error deleting section:", error);
      toast({
        title: "Error deleting section",
        description:
          "There was a problem deleting the section. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add a new item to a section
  const addItem = async (sectionId: string) => {
    try {
      const response = await fetch(apiUrl(`sections/${sectionId}/items`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to add item");
      }

      const data = await response.json();

      setSections((prevSections) => {
        return prevSections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              items: [...section.items, data.item],
            };
          }
          return section;
        });
      });

      toast({
        title: "Item added",
        description: "New item has been added successfully.",
      });
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error adding item",
        description: "There was a problem adding the item. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add a new bullet point to an item
  const addBulletPoint = async (sectionId: string, itemId: string) => {
    try {
      const response = await fetch(
        apiUrl(`sections/${sectionId}/items/${itemId}/bullets`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add bullet point");
      }

      const data = await response.json();

      setSections((prevSections) => {
        return prevSections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              items: section.items.map((item) => {
                if (item.id === itemId) {
                  return {
                    ...item,
                    bulletPoints: [...item.bulletPoints, data.bullet],
                  };
                }
                return item;
              }),
            };
          }
          return section;
        });
      });

      toast({
        title: "Bullet point added",
        description: "New bullet point has been added successfully.",
      });
    } catch (error) {
      console.error("Error adding bullet point:", error);
      toast({
        title: "Error adding bullet point",
        description:
          "There was a problem adding the bullet point. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update LaTeX content
  const updateLatexContent = async (latexId: string, newContent: string) => {
    try {
      // Call the backend API to update the LaTeX content
      const response = await fetch(apiUrl(`sections/${latexId}/title`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newContent }),
      });

      if (!response.ok) {
        throw new Error("Failed to update LaTeX content");
      }

      // Update the local state
      setSections((prevSections) => {
        return prevSections.map((section) => {
          if (section.id === latexId) {
            return { ...section, title: newContent };
          }
          return section;
        });
      });

      toast({
        title: "LaTeX updated",
        description: "LaTeX content has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating LaTeX:", error);
      toast({
        title: "Error updating LaTeX",
        description:
          "There was a problem updating the LaTeX content. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Generate PDF
  const generatePDF = useCallback(async () => {
    try {
      // Create a unique URL with timestamp to prevent caching
      const response = await fetch(apiUrl("pdf"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sections_json: sections }),
      });

      if (!response.ok) throw new Error("Failed to generate pdf");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      toast({ title: "PDF generated" });
    } catch (error) {
      toast({ title: "Error generating PDF", variant: "destructive" });
    }
  }, [toast, sections]);

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
              Generate PDF {":)))))))"}
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
              <Button size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
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
                          content: section.title, // Using title field for LaTeX content
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
