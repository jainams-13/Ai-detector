
import React from 'react';
import type { AnalysisResult } from '../types';
import { Verdict } from '../types';
import Gauge from './Gauge';

interface ResultDisplayProps {
  result: AnalysisResult;
  originalText: string;
}

const getVerdictDisplay = (verdict: Verdict) => {
  switch (verdict) {
    case Verdict.LIKELY_AI:
      return {
        text: 'Likely AI-Generated',
        bgColor: 'bg-red-900/50',
        textColor: 'text-red-300',
        borderColor: 'border-red-700',
        Icon: () => (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l-4 4-4-4 4-4" /></svg>
        ),
      };
    case Verdict.LIKELY_HUMAN:
      return {
        text: 'Likely Human-Written',
        bgColor: 'bg-green-900/50',
        textColor: 'text-green-300',
        borderColor: 'border-green-700',
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
        Icon: () => (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        ),
      };
  }
};

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const { verdict, confidence, explanation, keyCharacteristics } = result;
  const displayInfo = getVerdictDisplay(verdict);
  const { Icon } = displayInfo;

  return (
    <div className="space-y-6 animate-slide-in">
      <div className={`p-6 rounded-lg border ${displayInfo.borderColor} ${displayInfo.bgColor} grid md:grid-cols-3 gap-6 items-center`}>
        <div className="md:col-span-2">
          <div className="flex items-center space-x-3 mb-2">
            <Icon />
            <h2 className={`text-2xl font-bold ${displayInfo.textColor}`}>{displayInfo.text}</h2>
          </div>
          <p className="text-dark-text-secondary">{explanation}</p>
        </div>
        <div className="flex justify-center items-center">
          <Gauge value={confidence} verdict={verdict} />
        </div>
      </div>

      <div className="bg-dark-card p-6 rounded-lg shadow-lg border border-gray-700">
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
    </div>
  );
};

export default ResultDisplay;
