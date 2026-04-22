'use client';

import { useState, useEffect, useCallback } from 'react';
import ProjectSidebar from '@/components/ProjectSidebar';
import BrandForm from '@/components/BrandForm';
import type { Project } from '@/lib/types';
import { ALL_SECTIONS } from '@/lib/types';

type ProjectSummary = {
  id: string;
  name: string;
  product: string;
  market: string;
  status: string;
  updatedAt: string;
};

export default function Home() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch (e) {
      console.error('Failed to fetch projects', e);
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  async function handleSelectProject(id: string) {
    setLoadingProject(true);
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      setActiveProject(data);
    } catch (e) {
      console.error('Failed to load project', e);
    } finally {
      setLoadingProject(false);
    }
  }

  async function handleCreateProject(name: string) {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          product: '',
          market: 'US',
          price: '',
          angle: '',
          context: '',
          competitors: [],
          sections: [...ALL_SECTIONS],
          status: 'draft',
        }),
      });
      const project = await res.json();
      setProjects((prev) => [project, ...prev]);
      setActiveProject(project);
    } catch (e) {
      console.error('Failed to create project', e);
    }
  }

  async function handleDeleteProject(id: string) {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (activeProject?.id === id) setActiveProject(null);
    } catch (e) {
      console.error('Failed to delete project', e);
    }
  }

  async function handleSaveProject(updates: Partial<Project>) {
    if (!activeProject) return;
    try {
      const res = await fetch(`/api/projects/${activeProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updated = await res.json();
      setActiveProject(updated);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === updated.id
            ? { id: updated.id, name: updated.name, product: updated.product, market: updated.market, status: updated.status, updatedAt: updated.updatedAt }
            : p
        )
      );
    } catch (e) {
      console.error('Failed to save project', e);
      throw e;
    }
  }

  return (
    <div className="flex h-screen bg-bg-base overflow-hidden">
      <ProjectSidebar
        projects={projects}
        activeProjectId={activeProject?.id ?? null}
        onSelect={handleSelectProject}
        onCreate={handleCreateProject}
        onDelete={handleDeleteProject}
        loading={loadingProjects}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {loadingProject && (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}

        {!loadingProject && !activeProject && (
          <EmptyState onCreateProject={() => {
            const name = prompt('Project name:');
            if (name?.trim()) handleCreateProject(name.trim());
          }} />
        )}

        {!loadingProject && activeProject && (
          <BrandForm
            key={activeProject.id}
            project={activeProject}
            onSave={handleSaveProject}
          />
        )}
      </main>
    </div>
  );
}

function EmptyState({ onCreateProject }: { onCreateProject: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
      {/* Logo */}
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-lg shadow-accent-gold/20">
          <span className="text-2xl font-black text-bg-base">SG</span>
        </div>
        <div className="absolute -inset-2 rounded-2xl bg-gradient-gold opacity-10 blur-lg" />
      </div>

      <div className="text-center max-w-md">
        <h1 className="text-xl font-bold text-text-primary mb-2">Saint Graal</h1>
        <p className="text-text-secondary text-sm leading-relaxed">
          AI-powered market research generator for e-commerce brands running Meta Ads cold traffic.
          Create a project to get started.
        </p>
      </div>

      <button onClick={onCreateProject} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Create New Project
      </button>

      <div className="grid grid-cols-3 gap-4 max-w-lg mt-4">
        {[
          { icon: '⚡', label: 'Angles Marketing', desc: 'Cold traffic hooks that stop the scroll' },
          { icon: '💬', label: 'Verbatims Reddit', desc: 'Real customer language and pain points' },
          { icon: '🧠', label: 'Niveaux de Conscience', desc: "Schwartz's 5 awareness levels mapped" },
        ].map((f) => (
          <div key={f.label} className="card p-3 text-center">
            <div className="text-xl mb-1.5">{f.icon}</div>
            <p className="text-text-primary text-xs font-medium">{f.label}</p>
            <p className="text-text-muted text-[11px] mt-0.5">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-3">
      <svg className="w-8 h-8 text-accent-gold animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-text-muted text-xs">Loading project…</p>
    </div>
  );
}
