import React from 'react';
import type { PlagiarismResult } from '../types';

const SimilarityGauge: React.FC<{ value: number }> = ({ value }) => {
  const circumference = 2 * Math.PI * 45; // r = 45
  const offset = circumference - (value / 100) * circumference;

  const getColor = () => {
    if (value > 70) return 'stroke-red-400';
    if (value > 30) return 'stroke-yellow-400';
    return 'stroke-green-400';
  };
  
  const getTextColor = () => {
    if (value > 70) return 'fill-red-300';
    if (value > 30) return 'fill-yellow-300';
    return 'fill-green-300';
  };

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          className="text-gray-600"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        <circle
          className={`${getColor()} transition-all duration-1000 ease-out`}
          strokeWidth="10"
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
        <text
          x="50"
          y="50"
          className={`text-2xl font-bold ${getTextColor()}`}
          textAnchor="middle"
          dy=".3em"
        >
          {`${Math.round(value)}%`}
        </text>
         <text
          x="50"
          y="68"
          className="text-xs fill-dark-text-secondary"
          textAnchor="middle"
        >
          Similarity
        </text>
      </svg>
    </div>
  );
};


const PlagiarismResultDisplay: React.FC<{ result: PlagiarismResult }> = ({ result }) => {
  const { similarityScore, summary, matchedSources } = result;
  
  const scoreColorClass = similarityScore > 70 ? 'text-red-300' : similarityScore > 30 ? 'text-yellow-300' : 'text-green-300';
  
  return (
    <div className="space-y-6 animate-slide-in">
      <div className={`p-6 rounded-lg border border-gray-700 bg-dark-card grid md:grid-cols-3 gap-6 items-center`}>
         <div className="md:col-span-2">
          <div className="flex items-center space-x-3 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
            </svg>
            <h2 className={`text-2xl font-bold ${scoreColorClass}`}>Plagiarism Analysis Complete</h2>
          </div>
          <p className="text-dark-text-secondary">{summary}</p>
        </div>
        <div className="flex justify-center items-center">
          <SimilarityGauge value={similarityScore} />
        </div>
      </div>

      <div className="bg-dark-card p-6 rounded-lg shadow-lg border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-gray-200">
          {matchedSources.length > 0 ? 'Matched Sources' : 'No Matched Sources Found'}
        </h3>
        {matchedSources.length > 0 && (
          <ul className="space-y-4">
            {matchedSources.map((source, index) => (
              <li key={index} className="p-4 bg-gray-800/50 rounded-md border-l-4 border-brand-primary">
                <div className="flex justify-between items-start">
                  <div>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-light hover:underline break-all">
                      {source.title || source.url}
                    </a>
                    <p className="text-sm text-dark-text-secondary mt-1">{new URL(source.url).hostname}</p>
                  </div>
                  <span className={`font-bold text-lg ${source.similarity > 70 ? 'text-red-400' : source.similarity > 30 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {Math.round(source.similarity)}%
                  </span>
                </div>
                <p className="text-dark-text-secondary text-sm mt-2 italic border-l-2 border-gray-600 pl-3">
                  "{source.snippet}"
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PlagiarismResultDisplay;
