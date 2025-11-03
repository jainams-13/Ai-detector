import React, { useState } from 'react';
import type { RewriteResult } from '../types';

const RewriteSuggestionCard: React.FC<{ tone: string, text: string }> = ({ tone, text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-brand-light">{tone}</h4>
                <button 
                    onClick={handleCopy}
                    className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <p className="text-dark-text-secondary flex-grow">{text}</p>
        </div>
    );
};

const RewriteResultDisplay: React.FC<{ result: RewriteResult }> = ({ result }) => {
  const { suggestions } = result;
  
  return (
    <div className="space-y-6 animate-slide-in">
      <div className="bg-dark-card p-6 rounded-lg shadow-lg border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-gray-200">
            Rewrite Suggestions
        </h3>
        {suggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((suggestion, index) => (
              <RewriteSuggestionCard key={index} tone={suggestion.tone} text={suggestion.rewrittenText} />
            ))}
          </div>
        ) : (
            <p className="text-dark-text-secondary">No rewrite suggestions could be generated.</p>
        )}
      </div>
    </div>
  );
};

export default RewriteResultDisplay;
