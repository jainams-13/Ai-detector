

// FIX: Corrected a typo in the import statement to properly import React hooks.
import React, { useState, useMemo } from 'react';
import type { AnalysisResult } from '../types';
import { Verdict } from '../types';
import Gauge from './Gauge';

interface ResultDisplayProps {
  result: AnalysisResult;
  originalText: string;
}

const getVerdictDisplay = (verdict: Verdict) => {
  switch (verdict) {
    case Verdict.AI_GENERATED:
      return {
        text: 'AI-Generated',
        bgColor: 'bg-red-900/50',
        textColor: 'text-red-300',
        borderColor: 'border-red-700',
        compositionColor: 'bg-red-500',
        Icon: () => (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l-4 4-4-4 4-4" /></svg>
        ),
      };
    case Verdict.AI_ASSISTED:
      return {
        text: 'AI-Assisted',
        bgColor: 'bg-orange-900/50',
        textColor: 'text-orange-300',
        borderColor: 'border-orange-700',
        compositionColor: 'bg-orange-500',
        Icon: () => (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        ),
      };
    case Verdict.LIKELY_HUMAN:
      return {
        text: 'Likely Human-Written',
        bgColor: 'bg-green-900/50',
        textColor: 'text-green-300',
        borderColor: 'border-green-700',
        compositionColor: 'bg-green-500',
        Icon: () => (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        ),
      };
    case Verdict.UNCERTAIN:
    default:
      return {
        text: 'Uncertain',
        bgColor: 'bg-yellow-900/50',
        textColor: 'text-yellow-300',
        borderColor: 'border-yellow-700',
        compositionColor: 'bg-yellow-500',
        Icon: () => (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        ),
      };
  }
};

type Tab = 'findings' | 'details';

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const { verdict, confidence, explanation, keyCharacteristics, detailedAnalysis, aiPercentage } = result;
  const displayInfo = getVerdictDisplay(verdict);
  const { Icon } = displayInfo;
  const [activeTab, setActiveTab] = useState<Tab>('findings');

  const analysisStats = useMemo(() => {
    if (!detailedAnalysis) return null;
    const aiCount = detailedAnalysis.filter(s => s.classification === 'AI').length;
    const humanCount = detailedAnalysis.filter(s => s.classification === 'Human').length;
    return { aiCount, humanCount, total: detailedAnalysis.length };
  }, [detailedAnalysis]);

  const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({ label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary ${
        isActive
          ? 'bg-dark-card text-brand-light border-b-2 border-brand-primary'
          : 'bg-gray-800/50 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6 animate-slide-in">
      <div className={`p-6 rounded-lg border ${displayInfo.borderColor} ${displayInfo.bgColor} grid md:grid-cols-3 gap-6 items-center`}>
        <div className="md:col-span-2 space-y-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Icon />
              <h2 className={`text-2xl font-bold ${displayInfo.textColor}`}>{displayInfo.text}</h2>
            </div>
            <p className="text-dark-text-secondary">{explanation}</p>
          </div>
           <div className="pt-4">
              <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-semibold text-gray-300">AI Influence</h4>
                  <span className={`text-sm font-bold ${displayInfo.textColor}`}>{Math.round(aiPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                      className={`${displayInfo.compositionColor} h-2.5 rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${aiPercentage}%` }}
                  ></div>
              </div>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <Gauge value={confidence} verdict={verdict} />
        </div>
      </div>

      <div className="bg-dark-card rounded-lg shadow-lg border border-gray-700">
        <div className="border-b border-gray-700 px-4 pt-2">
          <nav className="flex space-x-2" aria-label="Tabs">
            <TabButton label="Key Findings" isActive={activeTab === 'findings'} onClick={() => setActiveTab('findings')} />
            {detailedAnalysis && (
              <TabButton label="Detailed Analysis" isActive={activeTab === 'details'} onClick={() => setActiveTab('details')} />
            )}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'findings' && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-semibold mb-4 text-gray-200">Key Characteristics</h3>
              <ul className="space-y-4">
                {keyCharacteristics.map((item, index) => (
                  <li key={index} className="p-4 bg-gray-800/50 rounded-md border-l-4 border-brand-primary">
                    <p className="font-semibold text-brand-light">{item.characteristic}</p>
                    <p className="text-dark-text-secondary text-sm mt-1 italic">"{item.evidence}"</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activeTab === 'details' && detailedAnalysis && analysisStats && (
            <div className="animate-fade-in space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-200">{analysisStats.total}</p>
                  <p className="text-sm text-dark-text-secondary">Total Sentences</p>
                </div>
                <div className="p-4 bg-red-900/30 rounded-lg">
                  <p className="text-2xl font-bold text-red-300">{analysisStats.aiCount}</p>
                  <p className="text-sm text-dark-text-secondary">AI-Generated</p>
                </div>
                <div className="p-4 bg-green-900/30 rounded-lg">
                  <p className="text-2xl font-bold text-green-300">{analysisStats.humanCount}</p>
                  <p className="text-sm text-dark-text-secondary">Human-Written</p>
                </div>
              </div>

              <div className="p-4 bg-gray-800 rounded-md text-dark-text-secondary leading-relaxed">
                <h4 className="text-lg font-semibold text-gray-200 mb-3">Analysis Breakdown</h4>
                <p>
                  {detailedAnalysis.map((item, index) => (
                    <span
                      key={index}
                      className={`transition-colors duration-300 p-1 rounded ${
                        item.classification === 'AI'
                          ? 'bg-red-500/20'
                          : 'bg-green-500/20'
                      }`}
                      title={`Reasoning: ${item.reasoning}`}
                    >
                      {item.sentence}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;