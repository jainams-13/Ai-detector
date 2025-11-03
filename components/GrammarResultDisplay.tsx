import React from 'react';
import type { GrammarResult } from '../types';

const GrammarResultDisplay: React.FC<{ result: GrammarResult, originalText: string }> = ({ result }) => {
  const { correctedText, errors } = result;
  
  return (
    <div className="space-y-6 animate-slide-in">
       <div className="bg-dark-card p-6 rounded-lg shadow-lg border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-gray-200">
            Corrected Text
        </h3>
        <p className="text-dark-text-secondary whitespace-pre-wrap">{correctedText}</p>
       </div>

      <div className="bg-dark-card p-6 rounded-lg shadow-lg border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-gray-200">
          {errors.length > 0 ? `${errors.length} Suggestions Found` : 'No Grammar Suggestions Found'}
        </h3>
        {errors.length > 0 && (
          <ul className="space-y-4">
            {errors.map((error, index) => (
              <li key={index} className="p-4 bg-gray-800/50 rounded-md border-l-4 border-yellow-500">
                <div className="text-sm space-y-2">
                    <p>
                        <span className="font-semibold text-red-400 mr-2">Original:</span>
                        <del className="text-red-400/80">{error.originalText}</del>
                    </p>
                    <p>
                        <span className="font-semibold text-green-400 mr-2">Suggestion:</span>
                        <ins className="text-green-400/80 no-underline">{error.correctedText}</ins>
                    </p>
                    <p className="text-dark-text-secondary pt-1">
                        <span className="font-semibold text-gray-400 mr-2">Reason:</span>
                        {error.explanation}
                    </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GrammarResultDisplay;
