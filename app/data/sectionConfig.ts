export type AvailableSectionItem = {
  id: string;
  label: string;
  items?: Array<{ id: string; label: string }>;
};

export const availableSections: AvailableSectionItem[] = [
  { id: 'indexSection5', label: 'Index Section 5 (Hero)', items: [] },
  { id: 'section1', label: 'Section 1 (Intro)', items: [] },
  { id: 'section2', label: 'Section 2 (Boat Ride)', items: [] },
  { id: 'section3', label: 'Section 3 (Gallery)', items: [] },
  { id: 'section4', label: 'Section 4 (Exclusive Tour)', items: [] },
  { id: 'section5', label: 'Section 5 (Departure)', items: [] },
  { id: 'timeline', label: 'Timeline', items: [] },
  { id: 'section6', label: 'Section 6 (Included Services)',
    items: [
      { id: 'list-item-1', label: 'Private transport' },
      { id: 'list-item-2', label: 'Pickup service' },
      { id: 'list-item-3', label: 'Guided tour' },
      { id: 'list-item-4', label: 'Boat ride' },
      { id: 'list-item-5', label: 'All taxes included' },
    ]
  },
  { id: 'card', label: 'Tour Card', items: [] },
];

export const defaultSectionOrder = [
  { id: 'indexSection5', enabled: true, order: 0 },
  { id: 'section1', enabled: true, order: 1 },
  { id: 'section2', enabled: true, order: 2 },
  { id: 'section3', enabled: true, order: 3 },
  { id: 'section4', enabled: true, order: 4 },
  { id: 'section5', enabled: true, order: 5 },
  { id: 'timeline', enabled: true, order: 6 },
  { id: 'section6', enabled: true, order: 7 },
  { id: 'card', enabled: true, order: 8 },
];
