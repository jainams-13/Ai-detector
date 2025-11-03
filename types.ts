export type DetectorMode = 'text' | 'image' | 'video' | 'voice' | 'code' | 'extension' | 'creator';
export type TextDetectorTab = 'ai' | 'plagiarism' | 'grammar' | 'rewrite';

export enum Verdict {
  AI_GENERATED = 'AI_GENERATED',
  AI_ASSISTED = 'AI_ASSISTED',
  LIKELY_HUMAN = 'LIKELY_HUMAN',
  UNCERTAIN = 'UNCERTAIN',
}

export interface KeyCharacteristic {
  characteristic: string;
  evidence: string;
}

export interface SentenceAnalysis {
  sentence: string;
  classification: 'AI' | 'Human';
  reasoning: string;
}

export interface AnalysisResult {
  verdict: Verdict;
  confidence: number;
  aiPercentage: number;
  explanation: string;
  keyCharacteristics: KeyCharacteristic[];
  detailedAnalysis?: SentenceAnalysis[];
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

// New types for Grammar Check
export interface GrammarError {
  originalText: string;
  correctedText: string;
  explanation: string;
}

export interface GrammarResult {
  correctedText: string;
  errors: GrammarError[];
}

// New types for Rewriting
export interface RewriteSuggestion {
  tone: string;
  rewrittenText: string;
}

export interface RewriteResult {
  suggestions: RewriteSuggestion[];
}