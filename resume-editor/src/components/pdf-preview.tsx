"use client";

import type { Section } from "@/components/resume-editor";

interface PDFPreviewProps {
  sections: Section[];
}

export function PDFPreview({ sections }: PDFPreviewProps) {
  // Filter out sections, items, and bullet points that are not active
  const activeContent = sections
    .filter((section) => section.status)
    .map((section) => ({
      ...section,
      items: section.items
        .filter((item) => item.status)
        .map((item) => ({
          ...item,
          bulletPoints: item.bulletPoints.filter((bullet) => bullet.status),
        })),
    }));

  return (
    <div className="font-serif h-full flex flex-col">
      <h1 className="text-center text-2xl font-bold mb-4 flex-shrink-0">
        Resume Preview
      </h1>

      <div className="flex-1 min-h-0">
        {activeContent.map((section) => (
          <div key={section.id} className="mb-6">
            <h2 className="text-xl font-bold uppercase border-b pb-1 mb-3">
              {section.title}
            </h2>

            {section.items.map((item) => (
              <div key={item.id} className="mb-4">
                <div className="flex justify-between mb-1">
                  <div>
                    <span
                      className="font-bold"
                      dangerouslySetInnerHTML={{ __html: item.title }}
                    />
                    {item.organization && (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: `, ${item.organization}`,
                        }}
                      />
                    )}
                  </div>
                  <div className="text-right">
                    {item.location && <div>{item.location}</div>}
                    {(item.startDate || item.endDate) && (
                      <div>
                        {item.startDate} {item.startDate && item.endDate && "–"}{" "}
                        {item.endDate}
                      </div>
                    )}
                  </div>
                </div>

                {item.bulletPoints.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1">
                    {item.bulletPoints.map((bullet) => (
                      <li
                        key={bullet.id}
                        dangerouslySetInnerHTML={{ __html: bullet.text }}
                        className="[&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800"
                      />
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ))}

        {activeContent.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No content to display. Add sections and items to see your resume
            preview.
          </div>
        )}
      </div>
    </div>
  );
}
