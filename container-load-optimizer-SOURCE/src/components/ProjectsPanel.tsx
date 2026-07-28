import { useMemo, useState } from 'react';
import { Copy, Save, Search, Trash2 } from 'lucide-react';
import type { CartonInput, SavedProject, Unit } from '../types';
import { deleteProject, duplicateProject, saveProject, searchProjects } from '../lib/projectStorage';

interface Props {
  containerId: string;
  unit: Unit;
  carton: CartonInput;
  loadingFactorPct: number;
  onLoad: (p: SavedProject) => void;
  refreshKey: number;
  bumpRefresh: () => void;
}

export function ProjectsPanel({ containerId, unit, carton, loadingFactorPct, onLoad, refreshKey, bumpRefresh }: Props) {
  const [query, setQuery] = useState('');
  const [projectName, setProjectName] = useState('');
  const [customer, setCustomer] = useState('');
  const [style, setStyle] = useState('');
  const [remarks, setRemarks] = useState('');

  const projects = useMemo(() => searchProjects(query), [query, refreshKey]);

  const handleSave = () => {
    if (!projectName.trim()) return;
    saveProject({
      projectName: projectName.trim(),
      customer: customer.trim() || undefined,
      style: style.trim() || undefined,
      date: new Date().toISOString().slice(0, 10),
      remarks: remarks.trim() || undefined,
      containerId,
      unit,
      loadingFactorPct,
      carton,
    });
    setProjectName('');
    setCustomer('');
    setStyle('');
    setRemarks('');
    bumpRefresh();

  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary mb-3">Save Current Calculation</h3>
        <div className="space-y-2">
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project name *"
            className="w-full rounded-lg border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface px-3 py-2 text-sm focus:border-accent"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Customer"
              className="rounded-lg border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface px-3 py-2 text-sm focus:border-accent"
            />
            <input
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="Style"
              className="rounded-lg border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface px-3 py-2 text-sm focus:border-accent"
            />
          </div>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Remarks"
            rows={2}
            className="w-full rounded-lg border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface px-3 py-2 text-sm focus:border-accent resize-none"
          />
          <button
            onClick={handleSave}
            disabled={!projectName.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent text-white text-sm font-medium py-2 disabled:opacity-40"
          >
            <Save className="w-4 h-4" /> Save Project
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary mb-3">Project History</h3>
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-lg border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface pl-8 pr-3 py-2 text-sm focus:border-accent"
          />
        </div>
        <div className="space-y-2 max-h-[280px] overflow-y-auto">
          {projects.length === 0 && (
            <p className="text-xs text-text-muted-light dark:text-text-muted py-4 text-center">No saved projects yet.</p>
          )}
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border-soft-light dark:border-border-soft px-3 py-2"
            >
              <button className="text-left flex-1 min-w-0" onClick={() => onLoad(p)}>
                <p className="text-sm font-medium truncate text-text-primary-light dark:text-text-primary">{p.projectName}</p>
                <p className="text-xs text-text-muted-light dark:text-text-muted truncate">
                  {[p.customer, p.style, p.date].filter(Boolean).join(' · ')}
                </p>
              </button>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => {
                    duplicateProject(p.id);
                    bumpRefresh();
                  }}
                  aria-label="Duplicate"
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-accent/10 text-text-muted-light dark:text-text-muted hover:text-accent"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    deleteProject(p.id);
                    bumpRefresh();
                  }}
                  aria-label="Delete"
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-danger/10 text-text-muted-light dark:text-text-muted hover:text-danger"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
