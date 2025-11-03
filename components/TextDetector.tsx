import React, { useState, useCallback, lazy, Suspense, useMemo } from 'react';
import TextInput from './TextInput';
import ResultDisplay from './ResultDisplay';
import { analyzeText, checkPlagiarism, checkGrammar, rewriteSentence } from '../services/geminiService';
import type { AnalysisResult, PlagiarismResult, GrammarResult, RewriteResult, TextDetectorTab } from '../types';
import Spinner from './Spinner';

const PlagiarismResultDisplay = lazy(() => import('./PlagiarismResultDisplay'));
const GrammarResultDisplay = lazy(() => import('./GrammarResultDisplay'));
const RewriteResultDisplay = lazy(() => import('./RewriteResultDisplay'));
const RewriteOptions = lazy(() => import('./RewriteOptions'));


const TextDetector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TextDetectorTab>('ai');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [plagiarismResult, setPlagiarismResult] = useState<PlagiarismResult | null>(null);
  const [grammarResult, setGrammarResult] = useState<GrammarResult | null>(null);
  const [rewriteResult, setRewriteResult] = useState<RewriteResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState<string>('');
  const [rewriteOptions, setRewriteOptions] = useState({ professional: true, normal: true });


  const handleAnalyze = useCallback(async (text: string, language: string) => {
    if (!text.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setPlagiarismResult(null);
    setGrammarResult(null);
    setRewriteResult(null);
    setCurrentText(text);

    try {
      switch (activeTab) {
        case 'ai':
          const aiResult = await analyzeText(text, language);
          setAnalysisResult(aiResult);
          break;
        case 'plagiarism':
          const plagResult = await checkPlagiarism(text);
          setPlagiarismResult(plagResult);
          break;
        case 'grammar':
          const grammarRes = await checkGrammar(text, language);
          setGrammarResult(grammarRes);
          break;
        case 'rewrite':
          if (!rewriteOptions.professional && !rewriteOptions.normal) {
            setError("Please select at least one rewrite style (Professional or Normal).");
            setIsLoading(false);
            return;
          }
          const rewriteRes = await rewriteSentence(text, rewriteOptions);
          setRewriteResult(rewriteRes);
          break;
      }
    } catch (err) {
      console.error(err);
      const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred.';
      setError(`Failed to get analysis. ${errorMessage}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, rewriteOptions]);

  const onTabChange = (tab: TextDetectorTab) => {
    setActiveTab(tab);
    setAnalysisResult(null);
    setPlagiarismResult(null);
    setGrammarResult(null);
    setRewriteResult(null);
    setError(null);
    setCurrentText('');
  };

  const getButtonLabel = () => {
    switch(activeTab) {
      case 'ai': return 'Analyze for AI';
      case 'plagiarism': return 'Check Plagiarism';
      case 'grammar': return 'Check Grammar';
      case 'rewrite': return 'Rewrite Text';
      default: return 'Analyze';
    }
  };
  
  const getPlaceholder = () => {
      switch(activeTab) {
        case 'ai': 
          return "Paste text here to check for AI generation...";
        case 'plagiarism': 
          return "Paste text here to check for plagiarism...";
        case 'grammar': 
          return "Paste text here to check for grammar and spelling errors...";
        case 'rewrite': 
          return "Paste text here to get rewrite suggestions...";
        default:
          return "Paste text here...";
      }
  }
  
  const showLanguageSelect = activeTab === 'ai' || activeTab === 'grammar';

  const isRewriteButtonDisabled = useMemo(() => {
    return activeTab === 'rewrite' && !rewriteOptions.professional && !rewriteOptions.normal;
  }, [activeTab, rewriteOptions]);

  const ResultSuspenseFallback = () => (
    <div className="mt-8 flex flex-col items-center justify-center">
      <Spinner />
      <p className="mt-4 text-dark-text-secondary">Loading results...</p>
    </div>
  );

  const OptionsSuspenseFallback = () => (
    <div className="bg-dark-card p-4 rounded-lg border border-gray-700 mb-6 h-[72px] animate-pulse"></div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-6 border-b border-gray-700 flex space-x-2 flex-wrap">
        <TabButton label="AI Detection" isActive={activeTab === 'ai'} onClick={() => onTabChange('ai')} />
        <TabButton label="Plagiarism Checker" isActive={activeTab === 'plagiarism'} onClick={() => onTabChange('plagiarism')} />
        <TabButton label="Grammar Check" isActive={activeTab === 'grammar'} onClick={() => onTabChange('grammar')} />
        <TabButton label="Sentence Rewriter" isActive={activeTab === 'rewrite'} onClick={() => onTabChange('rewrite')} />
      </div>

      {activeTab === 'rewrite' && (
        <Suspense fallback={<OptionsSuspenseFallback />}>
          <RewriteOptions options={rewriteOptions} onOptionsChange={setRewriteOptions} />
        </Suspense>
      )}

      <TextInput 
        key={activeTab}
        onAnalyze={handleAnalyze} 
        isLoading={isLoading} 
        buttonLabel={getButtonLabel()}
        promptPlaceholder={getPlaceholder()}
        showLanguageSelect={showLanguageSelect}
        isButtonDisabled={isRewriteButtonDisabled}
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
          {grammarResult && activeTab === 'grammar' && (
            <GrammarResultDisplay result={grammarResult} originalText={currentText} />
          )}
          {rewriteResult && activeTab === 'rewrite' && (
            <RewriteResultDisplay result={rewriteResult} />
          )}
        </Suspense>
      </div>
      
      {!isLoading && !analysisResult && !plagiarismResult && !grammarResult && !rewriteResult && !error && (
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
