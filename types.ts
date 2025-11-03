export type DetectorMode = 'text' | 'image' | 'video' | 'voice';

export enum Verdict {
  LIKELY_AI = 'LIKELY_AI',
  LIKELY_HUMAN = 'LIKELY_HUMAN',
  UNCERTAIN = 'UNCERTAIN',
}

export interface KeyCharacteristic {
  characteristic: string;
  evidence: string;
}

export interface AnalysisResult {
  verdict: Verdict;
  confidence: number;
  explanation: string;
  keyCharacteristics: KeyCharacteristic[];
}

// New types for Plagiarism
export interface MatchedSource {
  url: string;
  title: string;
  similarity: number;
  snippet: string;
}

export interface PlagiarismResult {
  similarityScore: number;
  summary: string;
  matchedSources: MatchedSource[];
}
