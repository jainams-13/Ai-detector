import React, { useState } from 'react';

interface TextInputProps {
  onAnalyze: (text: string, language: string) => void;
  isLoading: boolean;
  buttonLabel?: string;
  promptPlaceholder?: string;
  showLanguageSelect?: boolean;
}

const languages = [
  { code: 'auto', name: 'Auto-Detect' },
  { code: 'English', name: 'English' },
  { code: 'Spanish', name: 'Spanish' },
  { code: 'French', name: 'French' },
  { code: 'German', name: 'German' },
  { code: 'Hindi', name: 'Hindi' },
  { code: 'Gujarati', name: 'Gujarati' },
  { code: 'Chinese', name: 'Chinese' },
  { code: 'Russian', name: 'Russian' },
];

const TextInput: React.FC<TextInputProps> = ({ 
  onAnalyze, 
  isLoading, 
  buttonLabel = 'Analyze Text', 
  promptPlaceholder = "Paste your text here...",
  showLanguageSelect = true,
}) => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('auto');

  const handleAnalyzeClick = () => {
    onAnalyze(text, language);
  };

  return (
    <div className="bg-dark-card p-6 rounded-lg shadow-lg border border-gray-700">
      <div className={`grid ${showLanguageSelect ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-4 mb-4`}>
        <div className={showLanguageSelect ? 'md:col-span-2' : ''}>
            <label htmlFor="text-input" className="block text-lg font-medium text-dark-text">
                Enter Text for Analysis
            </label>
            <p className="text-sm text-dark-text-secondary mt-1">
                Paste the content you want to analyze. For best results, use text with at least 50 words.
            </p>
        </div>
        {showLanguageSelect && (
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
        )}
      </div>
      
      <textarea
        id="text-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={promptPlaceholder}
        className="w-full h-48 p-3 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition duration-200 text-dark-text resize-y"
        disabled={isLoading}
      />
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleAnalyzeClick}
          disabled={isLoading || !text.trim()}
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
            buttonLabel
          )}
        </button>
      </div>
    </div>
  );
};

export default TextInput;
