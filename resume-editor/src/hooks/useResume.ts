import { useState, useEffect, useCallback } from "react";
import { loadResume, saveResume } from "@/lib/storage";
import type { Resume, Section, ResumeItem, BulletPoint } from "@/types/resume";

export function useResume() {
  const [resume, setResume] = useState<Resume>({ sections: [] });

  useEffect(() => {
    const saved = loadResume();
    if (saved) setResume(saved);
  }, []);

  const update = useCallback((fn: (r: Resume) => Resume) => {
    setResume((prev) => {
      const next = fn(prev);
      saveResume(next);
      return next;
    });
  }, []);

  const addSection = useCallback(() => {
    update((r) => ({
      sections: [
        ...r.sections,
        {
          id: crypto.randomUUID(),
          type: "Section",
          title: "New Section",
          status: true,
          isCollapsed: false,
          json: null,
          items: [],
        },
      ],
    }));
  }, [update]);

  // Add a new LaTeX section (client-side)
  const addLaTeX = useCallback(() => {
    update((r) => ({
      sections: [
        ...r.sections,
        {
          id: crypto.randomUUID(),
          type: "LaTeX",
          title: "",
          status: true,
          isCollapsed: false,
          json: null,
          items: [],
        },
      ],
    }));
  }, [update]);

  // Add a new item to a section (client-side)
  const addItem = useCallback(
    (sectionId: string) => {
      update((r) => ({
        sections: r.sections.map((section) => {
          if (section.id !== sectionId) return section;
          // default JSON for new item
          const defaultTitleJSON = {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "New Item" }],
              },
            ],
          };
          const defaultOrgJSON = {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Organization" }],
              },
            ],
          };
          const newItem: ResumeItem = {
            id: crypto.randomUUID(),
            type: "Item",
            title: "New Item",
            organization: "Organization",
            startDate: "",
            endDate: "",
            location: "",
            status: true,
            isCollapsed: false,
            titleJSON: defaultTitleJSON,
            organizationJSON: defaultOrgJSON,
            bulletPoints: [] as BulletPoint[],
          };
          return { ...section, items: [...section.items, newItem] };
        }),
      }));
    },
    [update]
  );

  // Add a new bullet point to an item (client-side)
  const addBulletPoint = useCallback(
    (sectionId: string, itemId: string) => {
      update((r) => ({
        sections: r.sections.map((section) => {
          if (section.id !== sectionId) return section;
          return {
            ...section,
            items: section.items.map((item) => {
              if (item.id !== itemId) return item;
              const bullet: BulletPoint = {
                id: crypto.randomUUID(),
                type: "Bullet",
                text: "New bullet",
                html: null,
                json: {
                  type: "doc",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "New bullet" }],
                    },
                  ],
                },
                status: true,
              };
              return { ...item, bulletPoints: [...item.bulletPoints, bullet] };
            }),
          };
        }),
      }));
    },
    [update]
  );

  // Remove a section (client-side)
  const removeSection = useCallback(
    (sectionId: string) => {
      update((r) => ({
        sections: r.sections.filter((s) => s.id !== sectionId),
      }));
    },
    [update]
  );

  // Remove an item from a section (client-side)
  const removeItem = useCallback(
    (sectionId: string, itemId: string) => {
      update((r) => ({
        sections: r.sections.map((section) => {
          if (section.id !== sectionId) return section;
          return {
            ...section,
            items: section.items.filter((i) => i.id !== itemId),
          };
        }),
      }));
    },
    [update]
  );

  // Remove a bullet point from an item (client-side)
  const removeBulletPoint = useCallback(
    (sectionId: string, itemId: string, bulletId: string) => {
      update((r) => ({
        sections: r.sections.map((section) => {
          if (section.id !== sectionId) return section;
          return {
            ...section,
            items: section.items.map((item) => {
              if (item.id !== itemId) return item;
              return {
                ...item,
                bulletPoints: item.bulletPoints.filter(
                  (b) => b.id !== bulletId
                ),
              };
            }),
          };
        }),
      }));
    },
    [update]
  );

  // Update LaTeX content for a section (client-side)
  const updateLatexContent = useCallback(
    (sectionId: string, newContent: string) => {
      update((r) => ({
        sections: r.sections.map((section) =>
          section.id === sectionId ? { ...section, json: newContent } : section
        ),
      }));
    },
    [update]
  );

  // Toggle section status (client-side)
  const toggleSectionStatus = useCallback(
    (sectionId: string) => {
      update((r) => ({
        sections: r.sections.map((section) =>
          section.id === sectionId
            ? { ...section, status: !section.status }
            : section
        ),
      }));
    },
    [update]
  );

  // Toggle item status (client-side)
  const toggleItemStatus = useCallback(
    (sectionId: string, itemId: string) => {
      update((r) => ({
        sections: r.sections.map((section) => {
          if (section.id !== sectionId) return section;
          return {
            ...section,
            items: section.items.map((item) =>
              item.id === itemId ? { ...item, status: !item.status } : item
            ),
          };
        }),
      }));
    },
    [update]
  );

  // Toggle bullet point status (client-side)
  const toggleBulletStatus = useCallback(
    (sectionId: string, itemId: string, bulletId: string) => {
      update((r) => ({
        sections: r.sections.map((section) => {
          if (section.id !== sectionId) return section;
          return {
            ...section,
            items: section.items.map((item) => {
              if (item.id !== itemId) return item;
              return {
                ...item,
                bulletPoints: item.bulletPoints.map((b) =>
                  b.id === bulletId ? { ...b, status: !b.status } : b
                ),
              };
            }),
          };
        }),
      }));
    },
    [update]
  );

  // Update section title and json (client-side)
  const updateSectionTitle = useCallback(
    (sectionId: string, newTitle: string, newJson: any) => {
      update((r) => ({
        sections: r.sections.map((section) =>
          section.id === sectionId
            ? { ...section, title: newTitle, json: newJson }
            : section
        ),
      }));
    },
    [update]
  );

  // Update item fields (client-side)
  const updateItem = useCallback(
    (sectionId: string, itemId: string, updatedItem: Partial<ResumeItem>) => {
      update((r) => ({
        sections: r.sections.map((section) => {
          if (section.id !== sectionId) return section;
          return {
            ...section,
            items: section.items.map((item) =>
              item.id === itemId ? { ...item, ...updatedItem } : item
            ),
          };
        }),
      }));
    },
    [update]
  );

  // Update bullet point text and json (client-side)
  const updateBulletText = useCallback(
    (
      sectionId: string,
      itemId: string,
      bulletId: string,
      newText: string,
      newJson: any
    ) => {
      update((r) => ({
        sections: r.sections.map((section) => {
          if (section.id !== sectionId) return section;
          return {
            ...section,
            items: section.items.map((item) => {
              if (item.id !== itemId) return item;
              return {
                ...item,
                bulletPoints: item.bulletPoints.map((b) =>
                  b.id === bulletId ? { ...b, text: newText, json: newJson } : b
                ),
              };
            }),
          };
        }),
      }));
    },
    [update]
  );

  // Move a section within the resume (client-side)
  const moveSection = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      update((r) => {
        const newSections = [...r.sections];
        const [moved] = newSections.splice(dragIndex, 1);
        newSections.splice(hoverIndex, 0, moved);
        return { sections: newSections };
      });
    },
    [update]
  );

  // Move an item within a section (client-side)
  const moveItem = useCallback(
    (sectionId: string, dragIndex: number, hoverIndex: number) => {
      update((r) => ({
        sections: r.sections.map((section) => {
          if (section.id !== sectionId) return section;
          const newItems = [...section.items];
          const [moved] = newItems.splice(dragIndex, 1);
          newItems.splice(hoverIndex, 0, moved);
          return { ...section, items: newItems };
        }),
      }));
    },
    [update]
  );

  // Move a bullet point within an item (client-side)
  const moveBulletPoint = useCallback(
    (
      sectionId: string,
      itemId: string,
      dragIndex: number,
      hoverIndex: number
    ) => {
      update((r) => ({
        sections: r.sections.map((section) => {
          if (section.id !== sectionId) return section;
          return {
            ...section,
            items: section.items.map((item) => {
              if (item.id !== itemId) return item;
              const newBulletPoints = [...item.bulletPoints];
              const [moved] = newBulletPoints.splice(dragIndex, 1);
              newBulletPoints.splice(hoverIndex, 0, moved);
              return { ...item, bulletPoints: newBulletPoints };
            }),
          };
        }),
      }));
    },
    [update]
  );

  // Export current resume as JSON file
  const exportResume = useCallback(() => {
    const dataStr = JSON.stringify(resume, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [resume]);

  // Import resume from JSON string
  const importResume = useCallback(
    (jsonStr: string) => {
      try {
        const newResume = JSON.parse(jsonStr) as Resume;
        update(() => newResume);
      } catch (e) {
        console.error('Invalid JSON imported for resume', e);
      }
    },
    [update]
  );

  return {
    resume,
    exportResume,
    importResume,
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
  };
}
