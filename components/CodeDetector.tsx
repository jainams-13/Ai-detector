import React, { useState, useCallback } from 'react';
import CodeInput from './CodeInput';
import ResultDisplay from './ResultDisplay';
import { analyzeCode } from '../services/geminiService';
import type { AnalysisResult } from '../types';
import Spinner from './Spinner';

const CodeDetector: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCode, setCurrentCode] = useState<string>('');

  const handleAnalyze = useCallback(async (code: string, language: string) => {
    if (!code.trim()) {
      setError('Please enter some code to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setCurrentCode(code);

    try {
      const result = await analyzeCode(code, language);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred.';
      setError(`Failed to get analysis. ${errorMessage}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="animate-fade-in">
      <CodeInput 
        onAnalyze={handleAnalyze} 
        isLoading={isLoading} 
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
        {analysisResult && (
          <ResultDisplay result={analysisResult} originalText={currentCode} />
        )}
      </div>
      
      {!isLoading && !analysisResult && !error && (
         <div className="mt-8 text-center text-dark-text-secondary p-8 border-2 border-dashed border-gray-600 rounded-lg">
            <p>Your code analysis results will appear here.</p>
         </div>
      )}
    </div>
  );
};

export default CodeDetector;