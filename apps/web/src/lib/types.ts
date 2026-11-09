export type Category = "form" | "procedure" | "guideline" | "policy" | "program";
export const CATEGORIES: Category[] = ["form", "procedure", "guideline", "policy", "program"];

export type Doc = {
  id: string;
  title: string;
  category: Category | string;
  description: string;
  file: string; // file name inside public/files, or ""
  summary: string;
  text: string;
};
export type PublicDoc = Omit<Doc, "file"> & { file: string | null };

export type Group = { name: string; units: number; subjects: string[] };
export type Program = { id: string; name: string; short: string; intro: string; specializations: string[]; groups: Group[] };
export type Site = {
  contacts: { chair: string; emails: string[]; phone: string; facebook: string };
  programs: Program[];
};
export type Enrollment = {
  intro: string;
  link: { label: string; url: string };
  steps: { title: string; text: string }[];
  sections: { title: string; items: string[]; note: string }[];
};
