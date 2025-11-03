import React, { useState } from 'react';

interface CodeInputProps {
  onAnalyze: (code: string, language: string) => void;
  isLoading: boolean;
}

const languages = [
  { code: 'auto', name: 'Auto-Detect' },
  { code: 'JavaScript', name: 'JavaScript' },
  { code: 'Python', name: 'Python' },
  { code: 'Java', name: 'Java' },
  { code: 'C++', name: 'C++' },
  { code: 'TypeScript', name: 'TypeScript' },
  { code: 'Go', name: 'Go' },
  { code: 'Rust', name: 'Rust' },
  { code: 'SQL', name: 'SQL' },
];

const CodeInput: React.FC<CodeInputProps> = ({ 
  onAnalyze, 
  isLoading, 
}) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('auto');

  const handleAnalyzeClick = () => {
    onAnalyze(code, language);
  };

  return (
    <div className="bg-dark-card p-6 rounded-lg shadow-lg border border-gray-700">
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className='md:col-span-2'>
            <label htmlFor="code-input" className="block text-lg font-medium text-dark-text">
                Enter Code for Analysis
            </label>
            <p className="text-sm text-dark-text-secondary mt-1">
                Paste the code snippet you want to analyze. For best results, use a snippet with clear functionality.
            </p>
        </div>
        <div>
            <label htmlFor="language-select" className="block text-sm font-medium text-dark-text mb-1">
                Language
            </label>
            <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition duration-200 text-dark-text"
                disabled={isLoading}
            >
                {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
            </select>
        </div>
      </div>
      
      <textarea
        id="code-input"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste your code snippet here..."
        className="w-full h-64 p-3 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition duration-200 text-dark-text resize-y font-mono text-sm"
        disabled={isLoading}
      />
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleAnalyzeClick}
          disabled={isLoading || !code.trim()}
          className="px-6 py-3 bg-brand-primary text-white font-bold rounded-md hover:bg-brand-secondary disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            'Analyze Code'
          )}
        </button>
      </div>
    </div>
  );
};

export default CodeInput;