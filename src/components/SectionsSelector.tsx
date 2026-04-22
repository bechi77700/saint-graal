'use client';

import { ALL_SECTIONS, SECTION_LABELS, type SectionKey } from '@/lib/types';

const SECTION_ICONS: Record<SectionKey, string> = {
  angles_marketing: '⚡',
  verbatims_reddit: '💬',
  champ_lexical: '📖',
  objections: '🛡',
  analyse_concurrents: '🔍',
  benefices_features: '✨',
  niveaux_conscience: '🧠',
};

interface Props {
  selected: SectionKey[];
  onChange: (sections: SectionKey[]) => void;
}

export default function SectionsSelector({ selected, onChange }: Props) {
  function toggle(key: SectionKey) {
    if (selected.includes(key)) {
      onChange(selected.filter((s) => s !== key));
    } else {
      onChange([...selected, key]);
    }
  }

  function selectAll() {
    onChange([...ALL_SECTIONS]);
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Sections à Générer</h3>
          <p className="text-text-muted text-[11px] mt-0.5">{selected.length}/{ALL_SECTIONS.length} sections selected</p>
        </div>
        <div className="flex gap-2">
          <button onClick={selectAll} className="text-[11px] text-accent-gold hover:text-accent-gold-dim transition-colors">
            All
          </button>
          <span className="text-text-muted text-[11px]">·</span>
          <button onClick={clearAll} className="text-[11px] text-text-muted hover:text-text-secondary transition-colors">
            None
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {ALL_SECTIONS.map((key) => {
          const active = selected.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`section-tag ${active ? 'section-tag-active' : 'section-tag-inactive'}`}
            >
              <span>{SECTION_ICONS[key]}</span>
              <span>{SECTION_LABELS[key]}</span>
              {active && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
