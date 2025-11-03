import React, { useState, useCallback, lazy, Suspense } from 'react';
import TextInput from './TextInput';
import ResultDisplay from './ResultDisplay';
import { analyzeText, checkPlagiarism } from '../services/geminiService';
import type { AnalysisResult, PlagiarismResult } from '../types';
import Spinner from './Spinner';

const PlagiarismResultDisplay = lazy(() => import('./PlagiarismResultDisplay'));

type Tab = 'ai' | 'plagiarism';

const TextDetector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('ai');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [plagiarismResult, setPlagiarismResult] = useState<PlagiarismResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState<string>('');

  const handleAnalyze = useCallback(async (text: string, language: string) => {
    if (!text.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setPlagiarismResult(null);
    setCurrentText(text);

    try {
      if (activeTab === 'ai') {
        const result = await analyzeText(text, language);
        setAnalysisResult(result);
      } else {
        const result = await checkPlagiarism(text);
        setPlagiarismResult(result);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred.';
      setError(`Failed to get analysis. ${errorMessage}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  const onTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setAnalysisResult(null);
    setPlagiarismResult(null);
    setError(null);
    setCurrentText('');
  };

  const getButtonLabel = () => {
    return activeTab === 'ai' ? 'Analyze for AI' : 'Check Plagiarism';
  };
  
  const getPlaceholder = () => {
      return activeTab === 'ai' 
      ? "Paste text here to check for AI generation..."
      : "Paste text here to check for plagiarism...";
  }
  
  const ResultSuspenseFallback = () => (
    <div className="mt-8 flex flex-col items-center justify-center">
      <Spinner />
      <p className="mt-4 text-dark-text-secondary">Loading results...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-6 border-b border-gray-700 flex space-x-2">
        <TabButton label="AI Detection" isActive={activeTab === 'ai'} onClick={() => onTabChange('ai')} />
        <TabButton label="Plagiarism Checker" isActive={activeTab === 'plagiarism'} onClick={() => onTabChange('plagiarism')} />
      </div>

      <TextInput 
        key={activeTab}
        onAnalyze={handleAnalyze} 
        isLoading={isLoading} 
        buttonLabel={getButtonLabel()}
        promptPlaceholder={getPlaceholder()}
        showLanguageSelect={activeTab === 'ai'}
      />

      {error && (
        <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg animate-fade-in">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="mt-8 flex flex-col items-center justify-center">
          <Spinner />
          <p className="mt-4 text-dark-text-secondary">Analyzing... this may take a moment.</p>
        </div>
      )}
      
      <div className="mt-8">
        <Suspense fallback={<ResultSuspenseFallback />}>
          {analysisResult && activeTab === 'ai' && (
            <ResultDisplay result={analysisResult} originalText={currentText} />
          )}
          {plagiarismResult && activeTab === 'plagiarism' && (
            <PlagiarismResultDisplay result={plagiarismResult} />
          )}
        </Suspense>
      </div>
      
      {!isLoading && !analysisResult && !plagiarismResult && !error && (
         <div className="mt-8 text-center text-dark-text-secondary p-8 border-2 border-dashed border-gray-600 rounded-lg">
            <p>Your analysis results will appear here.</p>
         </div>
      )}
    </div>
  );
};

const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none ${
      isActive
        ? 'border-b-2 border-brand-primary text-brand-light'
        : 'text-gray-400 hover:text-gray-200 border-b-2 border-transparent'
    }`}
  >
    {label}
  </button>
);


export default TextDetector;
