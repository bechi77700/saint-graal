'use client';

import { useRef } from 'react';
import type { Competitor, UploadedFile } from '@/lib/types';

interface Props {
  competitors: Competitor[];
  onChange: (competitors: Competitor[]) => void;
}

export default function CompetitorSection({ competitors, onChange }: Props) {
  function addCompetitor() {
    onChange([...competitors, { id: crypto.randomUUID(), url: '', files: [] }]);
  }

  function removeCompetitor(id: string) {
    onChange(competitors.filter((c) => c.id !== id));
  }

  function updateUrl(id: string, url: string) {
    onChange(competitors.map((c) => (c.id === id ? { ...c, url } : c)));
  }

  function removeFile(competitorId: string, fileIndex: number) {
    onChange(
      competitors.map((c) =>
        c.id === competitorId
          ? { ...c, files: c.files.filter((_, i) => i !== fileIndex) }
          : c
      )
    );
  }

  async function handleFiles(id: string, fileList: FileList) {
    const newFiles: UploadedFile[] = await Promise.all(
      Array.from(fileList).map(async (file) => {
        const base64 = await readAsBase64(file);
        return { name: file.name, type: file.type, base64 };
      })
    );
    onChange(
      competitors.map((c) =>
        c.id === id ? { ...c, files: [...c.files, ...newFiles] } : c
      )
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Concurrents</h3>
          <p className="text-text-muted text-[11px] mt-0.5">URLs + screenshots/PDFs de leurs landing pages et pubs</p>
        </div>
        <button onClick={addCompetitor} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Competitor
        </button>
      </div>

      {competitors.length === 0 && (
        <div
          onClick={addCompetitor}
          className="border border-dashed border-bg-border rounded-lg p-6 text-center cursor-pointer
                     hover:border-accent-gold/30 transition-colors group"
        >
          <svg className="w-6 h-6 text-text-muted group-hover:text-accent-gold/60 mx-auto mb-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-text-muted text-xs">Click to add your first competitor</p>
        </div>
      )}

      {competitors.map((competitor, idx) => (
        <CompetitorCard
          key={competitor.id}
          competitor={competitor}
          index={idx}
          onUrlChange={(url) => updateUrl(competitor.id, url)}
          onFilesAdd={(files) => handleFiles(competitor.id, files)}
          onFileRemove={(fileIdx) => removeFile(competitor.id, fileIdx)}
          onRemove={() => removeCompetitor(competitor.id)}
        />
      ))}
    </div>
  );
}

interface CardProps {
  competitor: Competitor;
  index: number;
  onUrlChange: (url: string) => void;
  onFilesAdd: (files: FileList) => void;
  onFileRemove: (idx: number) => void;
  onRemove: () => void;
}

function CompetitorCard({ competitor, index, onUrlChange, onFilesAdd, onFileRemove, onRemove }: CardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files.length) onFilesAdd(e.dataTransfer.files);
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-xs font-medium">Competitor #{index + 1}</span>
        <button onClick={onRemove} className="btn-danger">Remove</button>
      </div>

      <input
        type="url"
        className="input-field"
        placeholder="https://competitor.com"
        value={competitor.url}
        onChange={(e) => onUrlChange(e.target.value)}
      />

      {/* Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border border-dashed border-bg-border rounded-md p-4 text-center cursor-pointer
                   hover:border-accent-gold/30 hover:bg-accent-gold/5 transition-all group"
      >
        <svg className="w-5 h-5 text-text-muted group-hover:text-accent-gold/60 mx-auto mb-1.5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-text-muted text-[11px]">Drop files here or click to upload</p>
        <p className="text-text-muted text-[10px] mt-0.5">Images (PNG, JPG, WebP) + PDFs</p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept="image/*,.pdf"
          onChange={(e) => e.target.files && onFilesAdd(e.target.files)}
        />
      </div>

      {/* File List */}
      {competitor.files.length > 0 && (
        <div className="space-y-1.5">
          {competitor.files.map((file, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-bg-elevated rounded-md">
              <FileIcon type={file.type} />
              <span className="text-text-secondary text-xs truncate flex-1">{file.name}</span>
              <button
                onClick={() => onFileRemove(i)}
                className="text-text-muted hover:text-accent-red transition-colors flex-shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FileIcon({ type }: { type: string }) {
  if (type === 'application/pdf') {
    return (
      <svg className="w-4 h-4 text-accent-red flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-accent-blue flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
    </svg>
  );
}

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
