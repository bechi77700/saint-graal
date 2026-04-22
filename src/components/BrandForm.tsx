'use client';

import { useState, useEffect } from 'react';
import CompetitorSection from './CompetitorSection';
import SectionsSelector from './SectionsSelector';
import ResultsView from './ResultsView';
import type { Project, ProjectFormData, SectionKey, Competitor, SaintGraalResults, AvatarResults } from '@/lib/types';
import { ALL_SECTIONS } from '@/lib/types';

interface Props {
  project: Project;
  onSave: (updates: Partial<Project>) => Promise<void>;
}

type ViewMode = 'form' | 'results';

export default function BrandForm({ project, onSave }: Props) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: project.name,
    product: project.product,
    market: (project.market as 'US' | 'FR' | 'DE') || 'US',
    price: project.price,
    angle: project.angle,
    context: project.context,
    competitors: project.competitors || [],
    sections: (project.sections as SectionKey[]) || [...ALL_SECTIONS],
  });

  const [view, setView] = useState<ViewMode>(project.results ? 'results' : 'form');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SaintGraalResults | null>(project.results);
  const [avatar, setAvatar] = useState<AvatarResults | null>(project.avatar);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setFormData({
      name: project.name,
      product: project.product,
      market: (project.market as 'US' | 'FR' | 'DE') || 'US',
      price: project.price,
      angle: project.angle,
      context: project.context,
      competitors: project.competitors || [],
      sections: (project.sections as SectionKey[]) || [...ALL_SECTIONS],
    });
    setResults(project.results);
    setAvatar(project.avatar);
    setView(project.results ? 'results' : 'form');
    setDirty(false);
  }, [project.id]);

  function update<K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({ ...formData, results, avatar });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate() {
    if (!formData.product.trim()) { setError('Product is required'); return; }
    if (!formData.name.trim()) { setError('Brand name is required'); return; }
    if (formData.sections.length === 0) { setError('Select at least one section'); return; }

    setError(null);
    setGenerating(true);

    await onSave({ ...formData, status: 'generating' });

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setResults(data.results);
      setAvatar(data.avatar);
      setView('results');
      setDirty(false);

      await onSave({ ...formData, results: data.results, avatar: data.avatar, status: 'done' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      await onSave({ status: 'error' });
    } finally {
      setGenerating(false);
    }
  }

  const canGenerate = formData.product.trim() && formData.name.trim() && formData.sections.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Project Header */}
      <div className="px-5 py-3.5 border-b border-bg-border flex items-center justify-between bg-bg-elevated/30">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-text-primary truncate max-w-xs">{project.name}</h2>
          {dirty && <span className="text-[10px] text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded border border-bg-border">unsaved</span>}
        </div>
        <div className="flex items-center gap-2">
          {results && (
            <div className="flex rounded-md overflow-hidden border border-bg-border">
              <TabToggle active={view === 'form'} onClick={() => setView('form')}>Form</TabToggle>
              <TabToggle active={view === 'results'} onClick={() => setView('results')}>Results</TabToggle>
            </div>
          )}
          {dirty && (
            <button onClick={handleSave} disabled={saving} className="btn-secondary text-xs py-1.5 px-3">
              {saving ? 'Saving…' : 'Save'}
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating || !canGenerate}
            className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
          >
            {generating ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mx-5 mt-3 px-4 py-2.5 bg-accent-red/10 border border-accent-red/30 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-red flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-accent-red text-xs">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-accent-red/60 hover:text-accent-red">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Generating overlay hint */}
      {generating && (
        <div className="mx-5 mt-3 px-4 py-2.5 shimmer bg-bg-card border border-accent-gold/20 rounded-md">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />
            <p className="text-accent-gold text-xs">Generating Saint Graal + Avatar documents in parallel…</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {view === 'form' ? (
          <div className="p-5 space-y-6 max-w-3xl">
            {/* Brand Info */}
            <FormSection title="Brand Information" subtitle="Core details about your brand and product">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Brand Name *">
                  <input
                    className="input-field"
                    placeholder="e.g. NovaSkin"
                    value={formData.name}
                    onChange={(e) => update('name', e.target.value)}
                  />
                </FormField>
                <FormField label="Market *">
                  <select
                    className="input-field"
                    value={formData.market}
                    onChange={(e) => update('market', e.target.value as 'US' | 'FR' | 'DE')}
                  >
                    <option value="US">🇺🇸 United States</option>
                    <option value="FR">🇫🇷 France</option>
                    <option value="DE">🇩🇪 Germany</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Product *">
                <input
                  className="input-field"
                  placeholder="e.g. Anti-aging serum with retinol"
                  value={formData.product}
                  onChange={(e) => update('product', e.target.value)}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Price Point">
                  <input
                    className="input-field"
                    placeholder="e.g. $49 / €59"
                    value={formData.price}
                    onChange={(e) => update('price', e.target.value)}
                  />
                </FormField>
                <FormField label="Marketing Angle">
                  <input
                    className="input-field"
                    placeholder="e.g. Anti-aging for busy moms 40+"
                    value={formData.angle}
                    onChange={(e) => update('angle', e.target.value)}
                  />
                </FormField>
              </div>

              <FormField label="Context & Additional Info">
                <textarea
                  className="input-field min-h-[90px] resize-none"
                  placeholder="Any additional context: unique ingredients, origin story, current positioning, target persona details…"
                  value={formData.context}
                  onChange={(e) => update('context', e.target.value)}
                />
              </FormField>
            </FormSection>

            {/* Sections */}
            <FormSection title="Sections" subtitle="Choose which research sections to generate">
              <SectionsSelector
                selected={formData.sections}
                onChange={(sections) => update('sections', sections)}
              />
            </FormSection>

            {/* Competitors */}
            <FormSection title="Concurrents" subtitle="Competitor analysis priority — add URLs and files">
              <CompetitorSection
                competitors={formData.competitors}
                onChange={(competitors: Competitor[]) => update('competitors', competitors)}
              />
            </FormSection>
          </div>
        ) : (
          results && (
            <div className="h-full flex flex-col">
              <ResultsView results={results} avatar={avatar} projectName={project.name} />
            </div>
          )
        )}
      </div>
    </div>
  );
}

function FormSection({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <p className="text-text-muted text-[11px] mt-0.5">{subtitle}</p>
      </div>
      <div className="space-y-3">{children}</div>
      <div className="border-t border-bg-border pt-1" />
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-text-secondary font-medium">{label}</label>
      {children}
    </div>
  );
}

function TabToggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium transition-colors
        ${active ? 'bg-bg-hover text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
    >
      {children}
    </button>
  );
}
