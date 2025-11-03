import React from 'react';

// FIX: Removed conflicting global declaration for window.aistudio.
// A global type definition for this is expected to exist elsewhere in the project,
// and redeclaring it was causing a TypeScript error.

interface ApiKeySelectorProps {
    onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            onKeySelected();
        }
    };

  return (
    <div className="animate-fade-in">
        <div className="bg-dark-card p-8 rounded-lg shadow-lg border border-gray-700 text-center">
             <div className="flex justify-center items-center mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1.258a1 1 0 01-.97-1.243l1.258-7.5a1 1 0 01.97-1.243H15z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-200">API Key Required</h2>
            <p className="mt-2 text-dark-text-secondary">
                The Video Creator uses advanced models that require you to select your own API key. Your key is stored securely and only used for your requests.
            </p>
            <button
            onClick={handleSelectKey}
            className="mt-6 px-8 py-3 bg-brand-primary text-white font-bold rounded-md hover:bg-brand-secondary transition-all duration-300"
            >
                Select API Key
            </button>
            <p className="text-xs text-gray-500 mt-4">
                For more information on billing, please visit the{' '}
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-brand-light hover:underline">
                    official documentation
                </a>.
            </p>
        </div>
    </div>
  );
};

export default ApiKeySelector;
