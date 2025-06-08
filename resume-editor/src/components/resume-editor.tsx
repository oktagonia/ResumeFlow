"use client";

import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ResumeSection } from "@/components/resume-section";
import { PDFPreview } from "@/components/pdf-preview";
import { Button } from "@/components/ui/button";
import { PlusCircle, Save, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ResizablePanels } from "@/components/resizable-panels";
import { auth } from "@/auth";
import { useRouter } from "next/navigation";
import { login } from "@/lib/actions/auth";

// Define the types for our hierarchical structure
export interface BulletPoint {
  id: string;
  text: string;
  status: boolean;
}

export interface ResumeItem {
  id: string;
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  location: string;
  status: boolean;
  isCollapsed: boolean;
  bulletPoints: BulletPoint[];
}

export interface Section {
  id: string;
  title: string;
  status: boolean;
  isCollapsed: boolean;
  items: ResumeItem[];
}

export default function ResumeEditor() {
  // Mock data - this would come from your API
  const [sections, setSections] = useState<Section[]>([
    {
      id: "1",
      title: "Experience",
      status: true,
      isCollapsed: false,
      items: [
        {
          id: "101",
          title:
            '<strong>Software Engineer</strong> - <a href="https://techcompany.com" target="_blank" rel="noopener noreferrer">Tech Company</a>',
          organization: "Tech Company",
          startDate: "Jan 2020",
          endDate: "Present",
          location: "San Francisco, CA",
          status: true,
          isCollapsed: false,
          bulletPoints: [
            {
              id: "1001",
              text: "Developed and maintained web applications using <strong>React</strong> and <strong>Node.js</strong>",
              status: true,
            },
            {
              id: "1002",
              text: "Improved application performance by <strong>40%</strong> through code optimization and <em>advanced caching strategies</em>",
              status: true,
            },
            {
              id: "1003",
              text: 'Collaborated with cross-functional teams to deliver features on time, check out our <a href="https://example.com" target="_blank" rel="noopener noreferrer">project showcase</a>',
              status: true,
            },
          ],
        },
        {
          id: "102",
          title: "<em>Junior Developer</em>",
          organization: "Startup Inc",
          startDate: "Jun 2018",
          endDate: "Dec 2019",
          location: "Austin, TX",
          status: true,
          isCollapsed: false,
          bulletPoints: [
            {
              id: "1004",
              text: "Built responsive user interfaces using <strong>HTML</strong>, <strong>CSS</strong>, and <strong>JavaScript</strong>",
              status: true,
            },
            {
              id: "1005",
              text: "Participated in code reviews and implemented feedback with <u>100% completion rate</u>",
              status: true,
            },
          ],
        },
      ],
    },
    {
      id: "2",
      title: "Education",
      status: true,
      isCollapsed: false,
      items: [
        {
          id: "201",
          title: "<strong>Bachelor of Science</strong> in Computer Science",
          organization: "University of Technology",
          startDate: "Sep 2014",
          endDate: "May 2018",
          location: "Boston, MA",
          status: true,
          isCollapsed: false,
          bulletPoints: [
            { id: "2001", text: "GPA: 3.8/4.0", status: true },
            {
              id: "2002",
              text: "Relevant coursework: Data Structures, Algorithms, Web Development",
              status: true,
            },
          ],
        },
      ],
    },
    {
      id: "3",
      title: "Skills",
      status: true,
      isCollapsed: false,
      items: [
        {
          id: "301",
          title: "Programming Languages",
          organization: "",
          startDate: "",
          endDate: "",
          location: "",
          status: true,
          isCollapsed: false,
          bulletPoints: [
            {
              id: "3001",
              text: "JavaScript, TypeScript, Python, Java",
              status: true,
            },
          ],
        },
        {
          id: "302",
          title: "Frameworks & Libraries",
          organization: "",
          startDate: "",
          endDate: "",
          location: "",
          status: true,
          isCollapsed: false,
          bulletPoints: [
            {
              id: "3002",
              text: "React, Next.js, Node.js, Express",
              status: true,
            },
          ],
        },
      ],
    },
  ]);

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      const response = await fetch(
        `http://localhost:8000/sections/${sectionId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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
        `http://localhost:8000/sections/${sectionId}/items/${itemId}/status`,
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
        `http://localhost:8000/sections/${sectionId}/items/${itemId}/bullets/${bulletId}/status`,
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
  const updateSectionTitle = async (sectionId: string, newTitle: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/sections/${sectionId}/title`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update section title");
      }
      const data = await response.json();
      setSections((prevSections) =>
        prevSections.map((section) =>
          section.id === sectionId
            ? { ...section, title: data.section.title }
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
  const updateItem = (
    sectionId: string,
    itemId: string,
    updatedItem: Partial<ResumeItem>
  ) => {
    setSections((prevSections) => {
      return prevSections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map((item) => {
              if (item.id === itemId) {
                return { ...item, ...updatedItem };
              }
              return item;
            }),
          };
        }
        return section;
      });
    });
  };

  // Update bullet point text
  const updateBulletText = (
    sectionId: string,
    itemId: string,
    bulletId: string,
    newText: string
  ) => {
    setSections((prevSections) => {
      return prevSections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map((item) => {
              if (item.id === itemId) {
                return {
                  ...item,
                  bulletPoints: item.bulletPoints.map((bullet) => {
                    if (bullet.id === bulletId) {
                      return { ...bullet, text: newText };
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
      });
    });
  };

  // Add a new section
  const addSection = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/sections/add-section",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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

  const removeSection = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/sections/${id}`, {
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
      const response = await fetch(
        `http://localhost:8000/sections/${sectionId}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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
        `http://localhost:8000/sections/${sectionId}/items/${itemId}/bullets`,
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

  // Save resume data
  const saveResume = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with your actual API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Resume saved",
        description: "Your resume has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving resume",
        description:
          "There was a problem saving your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Download PDF
  const downloadPDF = () => {
    // This would be implemented with your PDF generation logic
    toast({
      title: "Downloading PDF",
      description: "Your resume PDF is being generated and downloaded.",
    });
  };

  const router = useRouter();

  return (
    <ResizablePanels
      initialLeftWidth={45}
      minLeftWidth={30}
      maxLeftWidth={70}
      className="h-screen overflow-hidden"
      leftPanel={<PDFPreview sections={sections} />}
      rightPanel={
        <div className="h-full flex flex-col">
          <div className="flex flex-shrink-0 justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Resume Content</h2>
            <Button onClick={addSection}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Section
            </Button>
            <button
              onClick={() => {
                router.push("/login");
                login();
              }}
            >
              Login
            </button>
          </div>

          <div className="flex-1 min-h-0">
            <DndProvider backend={HTML5Backend}>
              <div className="space-y-4">
                {sections.map((section, index) => (
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
                ))}
              </div>
            </DndProvider>
          </div>
        </div>
      }
    />
  );
}
