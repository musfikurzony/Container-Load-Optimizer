import type { SavedProject } from '../types';

const KEY = 'sclo.projects.v1';

function readAll(): SavedProject[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedProject[]) : [];
  } catch {
    return [];
  }
}

function writeAll(projects: SavedProject[]) {
  localStorage.setItem(KEY, JSON.stringify(projects));
}

export function listProjects(): SavedProject[] {
  return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function saveProject(project: Omit<SavedProject, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): SavedProject {
  const all = readAll();
  const now = new Date().toISOString();

  if (project.id) {
    const idx = all.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      const updated: SavedProject = { ...all[idx], ...project, updatedAt: now };
      all[idx] = updated;
      writeAll(all);
      return updated;
    }
  }

  const created: SavedProject = {
    ...project,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  all.push(created);
  writeAll(all);
  return created;
}

export function deleteProject(id: string) {
  writeAll(readAll().filter((p) => p.id !== id));
}

export function duplicateProject(id: string): SavedProject | null {
  const all = readAll();
  const found = all.find((p) => p.id === id);
  if (!found) return null;
  const now = new Date().toISOString();
  const copy: SavedProject = {
    ...found,
    id: crypto.randomUUID(),
    projectName: `${found.projectName} (copy)`,
    createdAt: now,
    updatedAt: now,
  };
  all.push(copy);
  writeAll(all);
  return copy;
}

export function searchProjects(query: string): SavedProject[] {
  const q = query.trim().toLowerCase();
  if (!q) return listProjects();
  return listProjects().filter((p) =>
    [p.projectName, p.customer, p.style, p.remarks].filter(Boolean).some((v) => v!.toLowerCase().includes(q))
  );
}
