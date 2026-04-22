export type Market = 'US' | 'FR' | 'DE';

export type SectionKey =
  | 'angles_marketing'
  | 'verbatims_reddit'
  | 'champ_lexical'
  | 'objections'
  | 'analyse_concurrents'
  | 'benefices_features'
  | 'niveaux_conscience';

export const SECTION_LABELS: Record<SectionKey, string> = {
  angles_marketing: 'Angles Marketing',
  verbatims_reddit: 'Verbatims Reddit',
  champ_lexical: 'Champ Lexical',
  objections: 'Objections',
  analyse_concurrents: 'Analyse Concurrents',
  benefices_features: 'Bénéfices & Features',
  niveaux_conscience: 'Niveaux de Conscience',
};

export const ALL_SECTIONS: SectionKey[] = [
  'angles_marketing',
  'verbatims_reddit',
  'champ_lexical',
  'objections',
  'analyse_concurrents',
  'benefices_features',
  'niveaux_conscience',
];

export interface Competitor {
  id: string;
  url: string;
  files: UploadedFile[];
}

export interface UploadedFile {
  name: string;
  type: string;
  base64: string;
}

export interface ProjectFormData {
  name: string;
  product: string;
  market: Market;
  price: string;
  angle: string;
  context: string;
  competitors: Competitor[];
  sections: SectionKey[];
}

export interface SaintGraalSection {
  title: string;
  content: string;
  subsections?: { title: string; items: string[] }[];
}

export interface SaintGraalResults {
  sections: Record<SectionKey, SaintGraalSection>;
  generatedAt: string;
}

export interface AvatarResults {
  demographics: string;
  psychographics: string;
  pain_points: string[];
  desires: string[];
  triggers: string[];
  objections: string[];
  buying_journey: string;
  language_patterns: string[];
  generatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  product: string;
  market: string;
  price: string;
  angle: string;
  context: string;
  competitors: Competitor[];
  sections: SectionKey[];
  results: SaintGraalResults | null;
  avatar: AvatarResults | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}
