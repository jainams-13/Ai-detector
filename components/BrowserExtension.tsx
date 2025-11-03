import React from 'react';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 flex space-x-4">
    <div className="flex-shrink-0 text-brand-primary">{icon}</div>
    <div>
      <h3 className="text-lg font-semibold text-brand-light">{title}</h3>
      <p className="text-dark-text-secondary mt-1">{children}</p>
    </div>
  </div>
);

const BrowserExtension: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-8">
      <div className="bg-dark-card p-8 rounded-lg shadow-lg border border-gray-700 text-center">
        <div className="flex justify-center items-center mb-4">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-200">Deepfake Detector Browser Extension</h2>
        <p className="mt-2 text-lg text-dark-text-secondary">
          Integrate AI analysis directly into your browser for seamless, real-time content verification.
        </p>
        <button
          disabled
          className="mt-6 px-8 py-3 bg-gray-600 text-white font-bold rounded-md cursor-not-allowed inline-flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15v1a1 1 0 001 1h12a1 1 0 001-1v-1a1 1 0 00-.293-.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          <span>Coming Soon to the Chrome Web Store</span>
        </button>
      </div>

      <div className="bg-dark-card p-8 rounded-lg shadow-lg border border-gray-700">
         <h3 className="text-2xl font-semibold mb-6 text-gray-200">Key Features</h3>
         <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                title="On-Demand Video Analysis"
            >
                Analyze videos directly on platforms like YouTube or social media with a single click from a context menu.
            </FeatureCard>
             <FeatureCard 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
                title="Real-Time Heuristics"
            >
                Get passive, real-time feedback on images and text as you browse, flagging suspicious content automatically.
            </FeatureCard>
         </div>
      </div>

      <div className="bg-dark-card p-8 rounded-lg shadow-lg border border-gray-700">
         <h3 className="text-2xl font-semibold mb-6 text-gray-200">How to Install (Once Available)</h3>
         <ol className="relative border-l border-gray-700 space-y-10 ml-4">                  
            <li className="ml-8">            
                <span className="absolute flex items-center justify-center w-8 h-8 bg-brand-dark rounded-full -left-4 ring-4 ring-gray-800 text-brand-light font-bold">1</span>
                <h4 className="flex items-center mb-1 text-lg font-semibold text-gray-200">Visit the Chrome Web Store</h4>
                <p className="text-dark-text-secondary">Click the "Coming Soon" button above once it's active to be taken to our official extension page.</p>
            </li>
            <li className="ml-8">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-brand-dark rounded-full -left-4 ring-4 ring-gray-800 text-brand-light font-bold">2</span>
                <h4 className="flex items-center mb-1 text-lg font-semibold text-gray-200">Add to Chrome</h4>
                <p className="text-dark-text-secondary">Simply click the "Add to Chrome" button and confirm the permissions to install the extension.</p>
            </li>
            <li className="ml-8">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-brand-dark rounded-full -left-4 ring-4 ring-gray-800 text-brand-light font-bold">3</span>
                <h4 className="flex items-center mb-1 text-lg font-semibold text-gray-200">Start Analyzing</h4>
                <p className="text-dark-text-secondary">The AI Detector icon will appear in your browser's toolbar. Pin it for easy access and start verifying content across the web!</p>
            </li>
        </ol>
      </div>
    </div>
  );
};

export default BrowserExtension;
