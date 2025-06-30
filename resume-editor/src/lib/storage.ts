import type { Resume } from "@/types/resume";

const STORAGE_KEY = "resume-data";

export function loadResume(): Resume | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Resume) : null;
  } catch (err) {
    console.error("Failed to parse resume from storage:", err);
    return null;
  }
}

export function saveResume(resume: Resume): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
  } catch (err) {
    console.error("Failed to save resume to storage:", err);
  }
}

export function clearResume(): void {
  localStorage.removeItem(STORAGE_KEY);
}

//
