'use client';

import { useState } from 'react';
import type { Project } from '@/lib/types';

interface Props {
  projects: { id: string; name: string; product: string; market: string; status: string; updatedAt: string }[];
  activeProjectId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

export default function ProjectSidebar({ projects, activeProjectId, onSelect, onCreate, onDelete, loading }: Props) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    onCreate(name);
    setNewName('');
    setCreating(false);
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-bg-elevated border-r border-bg-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-bg-border">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded bg-gradient-gold flex items-center justify-center">
            <span className="text-[10px] font-black text-bg-base">SG</span>
          </div>
          <span className="text-text-primary font-semibold text-sm tracking-wide">Saint Graal</span>
        </div>
        <p className="text-text-muted text-[11px]">Market Research Generator</p>
      </div>

      {/* New Project Button */}
      <div className="p-3 border-b border-bg-border">
        {creating ? (
          <div className="flex flex-col gap-2">
            <input
              autoFocus
              className="input-field text-xs"
              placeholder="Brand / Project name…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') { setCreating(false); setNewName(''); }
              }}
            />
            <div className="flex gap-1.5">
              <button onClick={handleCreate} className="btn-primary text-xs flex-1 py-1.5">Create</button>
              <button onClick={() => { setCreating(false); setNewName(''); }} className="btn-secondary text-xs flex-1 py-1.5">Cancel</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-bg-border
                       text-text-muted text-xs hover:border-accent-gold/40 hover:text-accent-gold transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        )}
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading && (
          <div className="space-y-2 p-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-md shimmer bg-bg-card" />
            ))}
          </div>
        )}
        {!loading && projects.length === 0 && (
          <div className="text-center py-8">
            <p className="text-text-muted text-xs">No projects yet</p>
            <p className="text-text-muted text-[11px] mt-1">Create your first project above</p>
          </div>
        )}
        {projects.map((p) => (
          <div
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`group relative flex items-start gap-2 p-3 rounded-md cursor-pointer transition-all duration-150
              ${activeProjectId === p.id
                ? 'bg-accent-gold/10 border border-accent-gold/30'
                : 'border border-transparent hover:bg-bg-hover hover:border-bg-border'
              }`}
          >
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium truncate ${activeProjectId === p.id ? 'text-accent-gold' : 'text-text-primary'}`}>
                {p.name}
              </p>
              <p className="text-text-muted text-[11px] truncate mt-0.5">{p.product || 'No product set'}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] text-text-muted">{p.market}</span>
                <span className="text-[10px] text-text-muted">·</span>
                <StatusBadge status={p.status} />
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded text-text-muted hover:text-accent-red transition-all"
              title="Delete project"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-bg-border">
        <p className="text-text-muted text-[10px] text-center">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </p>
      </div>
    </aside>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'text-text-muted' },
    generating: { label: 'Generating…', color: 'text-accent-gold' },
    done: { label: 'Done', color: 'text-accent-green' },
    error: { label: 'Error', color: 'text-accent-red' },
  };
  const s = map[status] || map.draft;
  return <span className={`text-[10px] font-medium ${s.color}`}>{s.label}</span>;
}
