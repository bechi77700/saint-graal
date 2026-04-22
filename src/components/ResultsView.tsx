'use client';

import { useState } from 'react';
import type { SaintGraalResults, AvatarResults, SectionKey } from '@/lib/types';
import { SECTION_LABELS } from '@/lib/types';

interface Props {
  results: SaintGraalResults;
  avatar: AvatarResults | null;
  projectName: string;
}

type Tab = 'saint-graal' | 'avatar';

export default function ResultsView({ results, avatar, projectName }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('saint-graal');
  const [copied, setCopied] = useState(false);
  const [activeSectionKey, setActiveSectionKey] = useState<SectionKey | null>(
    results.sections ? (Object.keys(results.sections)[0] as SectionKey) : null
  );

  function exportJSON() {
    const data = { project: projectName, results, avatar, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saint-graal-${projectName.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyToClipboard() {
    const data = { project: projectName, results, avatar, exportedAt: new Date().toISOString() };
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const sectionKeys = results.sections ? (Object.keys(results.sections) as SectionKey[]) : [];
  const activeSection = activeSectionKey ? results.sections?.[activeSectionKey] : null;

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-bg-border bg-bg-elevated/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-slow" />
            <span className="text-accent-green text-xs font-medium">Generated</span>
          </div>
          <span className="text-text-muted text-xs">·</span>
          <span className="text-text-muted text-xs">
            {new Date(results.generatedAt).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyToClipboard} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy JSON
              </>
            )}
          </button>
          <button onClick={exportJSON} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export JSON
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-bg-border px-5 bg-bg-elevated/30">
        <TabButton active={activeTab === 'saint-graal'} onClick={() => setActiveTab('saint-graal')}>
          ⚔️ Saint Graal
        </TabButton>
        {avatar && (
          <TabButton active={activeTab === 'avatar'} onClick={() => setActiveTab('avatar')}>
            👤 Avatar
          </TabButton>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {activeTab === 'saint-graal' && (
          <>
            {/* Section Nav */}
            <div className="w-52 flex-shrink-0 border-r border-bg-border overflow-y-auto bg-bg-elevated/20">
              <div className="p-2 space-y-0.5">
                {sectionKeys.map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveSectionKey(key)}
                    className={`w-full text-left px-3 py-2 rounded-md text-xs transition-all
                      ${activeSectionKey === key
                        ? 'bg-accent-gold/10 text-accent-gold border border-accent-gold/20'
                        : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary border border-transparent'
                      }`}
                  >
                    {SECTION_LABELS[key] || key}
                  </button>
                ))}
              </div>
            </div>

            {/* Section Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeSection ? (
                <SectionContent section={activeSection} sectionKey={activeSectionKey!} />
              ) : (
                <EmptyState />
              )}
            </div>
          </>
        )}

        {activeTab === 'avatar' && avatar && (
          <div className="flex-1 overflow-y-auto p-6">
            <AvatarView avatar={avatar} />
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors
        ${active
          ? 'border-accent-gold text-accent-gold'
          : 'border-transparent text-text-secondary hover:text-text-primary'
        }`}
    >
      {children}
    </button>
  );
}

function SectionContent({ section, sectionKey }: { section: { title: string; content: string; subsections?: { title: string; items: string[] }[] }; sectionKey: SectionKey }) {
  return (
    <div className="max-w-3xl space-y-6 animate-slide-up">
      <div>
        <h2 className="text-lg font-bold text-text-primary mb-1">{section.title}</h2>
        <div className="w-12 h-0.5 bg-gradient-gold rounded-full" />
      </div>

      {section.content && (
        <div className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
          {section.content}
        </div>
      )}

      {section.subsections && section.subsections.length > 0 && (
        <div className="space-y-5">
          {section.subsections.map((sub, i) => (
            <div key={i} className="card p-4">
              <h3 className="text-sm font-semibold text-accent-gold mb-3">{sub.title}</h3>
              {sub.items.length > 0 && (
                <ul className="space-y-2">
                  {sub.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="text-accent-gold/60 mt-0.5 flex-shrink-0">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AvatarView({ avatar }: { avatar: AvatarResults }) {
  const listSections: (keyof AvatarResults)[] = ['pain_points', 'desires', 'triggers', 'objections', 'language_patterns'];
  const listLabels: Record<string, string> = {
    pain_points: 'Pain Points',
    desires: 'Desires & Aspirations',
    triggers: 'Buying Triggers',
    objections: 'Pre-Purchase Objections',
    language_patterns: 'Language Patterns',
  };

  return (
    <div className="max-w-3xl space-y-6 animate-slide-up">
      <div>
        <h2 className="text-lg font-bold text-text-primary mb-1">Customer Avatar</h2>
        <div className="w-12 h-0.5 bg-gradient-gold rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <InfoCard title="Demographics" content={avatar.demographics} />
        <InfoCard title="Psychographics" content={avatar.psychographics} />
        <InfoCard title="Buying Journey" content={avatar.buying_journey} />

        {listSections.map((key) => {
          const items = avatar[key] as string[];
          if (!items || !items.length) return null;
          return (
            <div key={key} className="card p-4">
              <h3 className="text-sm font-semibold text-accent-gold mb-3">{listLabels[key] || key}</h3>
              <ul className="space-y-1.5">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="text-accent-gold/60 mt-0.5 flex-shrink-0">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InfoCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-accent-gold mb-2">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">{content}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-text-muted text-sm">Select a section from the left</p>
    </div>
  );
}
