import React, { useState, Suspense, lazy } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import type { DetectorMode } from './types';
import Spinner from './components/Spinner';

const TextDetector = lazy(() => import('./components/TextDetector'));
const ImageDetector = lazy(() => import('./components/ImageDetector'));
const DeepfakeDetector = lazy(() => import('./components/DeepfakeDetector'));
const VoiceDetector = lazy(() => import('./components/VoiceDetector'));
const CodeDetector = lazy(() => import('./components/CodeDetector'));
const BrowserExtension = lazy(() => import('./components/BrowserExtension'));
const VideoCreator = lazy(() => import('./components/VideoCreator'));

const App: React.FC = () => {
  const [mode, setMode] = useState<DetectorMode>('text');

  const renderDetector = () => {
    switch (mode) {
      case 'image':
        return <ImageDetector />;
      case 'video':
        return <DeepfakeDetector />;
      case 'voice':
        return <VoiceDetector />;
      case 'code':
        return <CodeDetector />;
      case 'extension':
        return <BrowserExtension />;
      case 'creator':
        return <VideoCreator />;
      case 'text':
      default:
        return <TextDetector />;
    }
  };
  
  const SuspenseFallback = () => (
    <div className="flex-1 flex items-center justify-center">
       <div className="flex flex-col items-center justify-center">
          <Spinner />
          <p className="mt-4 text-dark-text-secondary">Loading module...</p>
        </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-dark-bg font-sans text-dark-text">
      <Sidebar mode={mode} setMode={setMode} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="container mx-auto p-4 md:p-8 flex-1">
            <div className="max-w-4xl mx-auto">
               <Suspense fallback={<SuspenseFallback />}>
                {renderDetector()}
              </Suspense>
            </div>
          </div>
          <footer className="text-center pt-4 pb-4 text-xs text-gray-500">
            <p>Powered by Gemini. For educational purposes only.</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default App;