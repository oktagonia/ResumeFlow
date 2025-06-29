export interface BulletPoint {
  id: string;
  type: string; // e.g. "BulletPoint"
  text: string;
  html?: string | null;
  json?: any | null;
  status: boolean;
}

export interface ResumeItem {
  id: string;
  type: string; // "Item"
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  location: string;
  status: boolean;
  isCollapsed: boolean;
  titleJSON?: any | null;
  organizationJSON?: any | null;
  bulletPoints: BulletPoint[];
}

export interface Section {
  id: string;
  type: string; // "Section" or "LaTeX"
  title: string;
  status: boolean;
  isCollapsed: boolean;
  json?: any | null;
  items: ResumeItem[];
}

export interface Resume {
  sections: Section[];
}
