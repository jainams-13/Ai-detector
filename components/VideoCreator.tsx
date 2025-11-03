import React, { useState, useCallback, useEffect, useRef } from 'react';
import FileInput from './FileInput';
import ApiKeySelector from './ApiKeySelector';
import Spinner from './Spinner';
import { createVideo } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';

const loadingMessages = [
    "Warming up the digital cameras...",
    "Briefing the virtual director...",
    "Scouting digital locations...",
    "Rendering the first few scenes...",
    "Applying cinematic magic...",
    "The AI is checking the lighting...",
    "Polishing the final cut...",
    "Almost there, just adding the final touches...",
];

const VideoCreator: React.FC = () => {
  const [isKeySelected, setIsKeySelected] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const messageIntervalRef = useRef<number | null>(null);

  const checkApiKey = async () => {
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsKeySelected(hasKey);
    }
  };

  useEffect(() => {
    checkApiKey();
  }, []);

  useEffect(() => {
    if (isLoading) {
      let i = 0;
      setLoadingMessage(loadingMessages[i]);
      messageIntervalRef.current = window.setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[i]);
      }, 5000);
    } else if (messageIntervalRef.current) {
      clearInterval(messageIntervalRef.current);
    }
    return () => {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
    };
  }, [isLoading]);

  const handleFileChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
        setError('Please enter a prompt to describe the video you want to create.');
        return;
    }

    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio.openSelectKey();
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsKeySelected(hasKey);
        if (!hasKey) {
            setError("An API key is required to generate videos. Please select one.");
            return;
        }
    }

    setIsLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
        let imagePayload = null;
        if (imageFile) {
            const imageBytes = await fileToBase64(imageFile);
            imagePayload = { imageBytes, mimeType: imageFile.type };
        }

        const onProgress = (message: string) => {
            // This is a simple progress update. For more granular control, you could use a state variable.
            console.log("Progress:", message);
        };
        
        const generatedUrl = await createVideo(prompt, imagePayload, { resolution, aspectRatio }, onProgress);
        setVideoUrl(generatedUrl);

    } catch (err) {
        console.error(err);
        let errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred.';
        if (errorMessage.includes("Requested entity was not found.")) {
             errorMessage = "API Key error. Please try selecting your API key again.";
             setIsKeySelected(false);
        }
        setError(`Failed to generate video. ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [prompt, imageFile, resolution, aspectRatio]);

  if (!isKeySelected) {
    return <ApiKeySelector onKeySelected={() => setIsKeySelected(true)} />;
  }
  
  return (
    <div className="animate-fade-in space-y-6">
       <div className="bg-dark-card p-6 rounded-lg shadow-lg border border-gray-700 space-y-4">
            <div>
                <label htmlFor="prompt-input" className="block text-lg font-medium text-dark-text">
                    Video Prompt
                </label>
                <p className="text-sm text-dark-text-secondary mt-1">
                    Describe the video you want to create. Be as descriptive as possible!
                </p>
            </div>
             <textarea
                id="prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A neon hologram of a cat driving a sports car at top speed..."
                className="w-full h-24 p-3 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition duration-200 text-dark-text resize-y"
                disabled={isLoading}
            />
       </div>

      <FileInput
        onFileChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        label="Starting Image (Optional)"
        disabled={isLoading}
      />
      
      {imagePreview && (
        <div className="bg-dark-card p-4 rounded-lg border border-gray-700">
            <h3 className="text-lg font-medium text-dark-text mb-2">Image Preview</h3>
            <img src={imagePreview} alt="Preview" className="max-w-xs max-h-48 mx-auto rounded-md" />
        </div>
      )}

       <div className="bg-dark-card p-6 rounded-lg shadow-lg border border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <label htmlFor="aspect-ratio" className="block text-sm font-medium text-dark-text mb-1">Aspect Ratio</label>
              <select id="aspect-ratio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value as any)} className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-primary" disabled={isLoading}>
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Portrait)</option>
              </select>
           </div>
           <div>
              <label htmlFor="resolution" className="block text-sm font-medium text-dark-text mb-1">Resolution</label>
              <select id="resolution" value={resolution} onChange={e => setResolution(e.target.value as any)} className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-primary" disabled={isLoading}>
                  <option value="720p">720p</option>
                  {/* <option value="1080p">1080p</option> */}
              </select>
           </div>
       </div>

      <div className="flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="px-6 py-3 bg-brand-primary text-white font-bold rounded-md hover:bg-brand-secondary disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center"
        >
          {isLoading ? 'Generating...' : 'Generate Video'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="mt-8 flex flex-col items-center justify-center text-center">
          <Spinner />
          <p className="mt-4 text-dark-text-secondary font-semibold text-lg">{loadingMessage}</p>
          <p className="text-sm text-gray-500 mt-2">Video creation can take several minutes. Please be patient.</p>
        </div>
      )}

      {videoUrl && (
        <div className="mt-8 animate-fade-in bg-dark-card p-4 rounded-lg border border-gray-700 space-y-4">
            <h3 className="text-xl font-semibold text-gray-200">Your Video is Ready!</h3>
            <video src={videoUrl} controls autoPlay loop className="w-full mx-auto rounded-md" />
            <a href={videoUrl} download="generated-video.mp4" className="block w-full text-center px-6 py-3 bg-brand-primary text-white font-bold rounded-md hover:bg-brand-secondary transition-all duration-300">
                Download Video
            </a>
        </div>
      )}
    </div>
  );
};

export default VideoCreator;