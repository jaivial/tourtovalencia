import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, ChevronRightIcon } from "lucide-react";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { SectionOrderItem } from "~/data/data";

interface SectionOrderEditorProps {
  sections: SectionOrderItem[];
  onSectionsChange: (sections: SectionOrderItem[]) => void;
  availableSections: Array<{ id: string; label: string; items?: Array<{ id: string; label: string }> }>;
}

export const SectionOrderEditor: React.FC<SectionOrderEditorProps> = ({
  sections,
  onSectionsChange,
  availableSections,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSectionExpanded = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleSectionToggle = (sectionId: string, enabled: boolean) => {
    onSectionsChange(
      sections.map((s) => (s.id === sectionId ? { ...s, enabled } : s))
    );
  };

  const handleMoveSection = (sectionId: string, direction: "up" | "down") => {
    const sortedSections = [...sections].sort((a, b) => a.order - b.order);
    const index = sortedSections.findIndex((s) => s.id === sectionId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sortedSections.length) return;

    const updatedSections = sortedSections.map((s, i) => {
      if (i === index) return { ...s, order: sortedSections[newIndex].order };
      if (i === newIndex) return { ...s, order: sortedSections[index].order };
      return s;
    });

    onSectionsChange(updatedSections);
  };

  const handleRemoveSection = (sectionId: string) => {
    onSectionsChange(sections.filter((s) => s.id !== sectionId));
  };

  const handleAddSection = (sectionId: string) => {
    if (sections.some((s) => s.id === sectionId)) return;
    const maxOrder = sections.reduce((max, s) => Math.max(max, s.order), -1);
    onSectionsChange([...sections, { id: sectionId, enabled: true, order: maxOrder + 1 }]);
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);
  const unaddedSections = availableSections.filter(
    (as) => !sections.some((s) => s.id === as.id)
  );

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors rounded-lg"
      >
        <span className="text-lg font-semibold text-gray-900">
          Gestionar Secciones
        </span>
        {isExpanded ? (
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronRightIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {sortedSections.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay secciones configuradas. Añade una sección para comenzar.
            </p>
          )}

          {sortedSections.map((section, index) => {
            const sectionInfo = availableSections.find((as) => as.id === section.id);
            const isSectionExpanded = expandedSections.has(section.id);

            return (
              <div
                key={section.id}
                className="border border-gray-200 rounded-lg p-3 bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveSection(section.id, "up")}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUpIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveSection(section.id, "down")}
                      disabled={index === sortedSections.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Label htmlFor={`section-${section.id}`} className="font-medium text-gray-900">
                        {sectionInfo?.label || section.id}
                      </Label>
                    </div>
                    {sectionInfo?.items && sectionInfo.items.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleSectionExpanded(section.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-1"
                      >
                        {isSectionExpanded ? "Ocultar" : "Mostrar"} elementos
                        ({sectionInfo.items.length})
                      </button>
                    )}
                  </div>

                  <Switch
                    id={`section-${section.id}`}
                    checked={section.enabled}
                    onCheckedChange={(enabled) => handleSectionToggle(section.id, enabled)}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSection(section.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Eliminar
                  </Button>
                </div>

                {isSectionExpanded && sectionInfo?.items && sectionInfo.items.length > 0 && (
                  <div className="mt-3 pl-8 space-y-2">
                    {sectionInfo.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {unaddedSections.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Añadir sección:</p>
              <div className="flex flex-wrap gap-2">
                {unaddedSections.map((section) => (
                  <Button
                    key={section.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSection(section.id)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    + {section.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionOrderEditor;
