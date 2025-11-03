import React, { useState, useCallback } from 'react';
import FileInput from './FileInput';
import ResultDisplay from './ResultDisplay';
import { analyzeVideoFrames } from '../services/geminiService';
import type { AnalysisResult } from '../types';
import Spinner from './Spinner';
import { extractVideoFrames } from '../utils/fileUtils';

const FRAME_COUNT = 4; // Number of frames to extract from the video

const VideoDetector: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    setVideoFile(file);
    setAnalysisResult(null);
    setError(null);
    if (file) {
      setVideoPreview(URL.createObjectURL(file));
    } else {
      setVideoPreview(null);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!videoFile) {
      setError('Please select a video file to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      setLoadingMessage(`Extracting ${FRAME_COUNT} frames from video...`);
      const frames = await extractVideoFrames(videoFile, FRAME_COUNT);

      setLoadingMessage('Analyzing video frames with AI...');
      const result = await analyzeVideoFrames(frames);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze the video. The file may be corrupt, in an unsupported format, or the analysis request failed.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [videoFile]);

  return (
    <div className="animate-fade-in space-y-6">
      <FileInput
        onFileChange={handleFileChange}
        accept="video/mp4, video/webm"
        label="Video File"
        disabled={isLoading}
      />
      
      {videoPreview && (
        <div className="bg-dark-card p-4 rounded-lg border border-gray-700">
            <h3 className="text-lg font-medium text-dark-text mb-2">Video Preview</h3>
            <video src={videoPreview} controls className="max-w-full max-h-96 mx-auto rounded-md" />
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleAnalyze}
          disabled={isLoading || !videoFile}
          className="px-6 py-3 bg-brand-primary text-white font-bold rounded-md hover:bg-brand-secondary disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Video'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="mt-8 flex flex-col items-center justify-center">
          <Spinner />
          <p className="mt-4 text-dark-text-secondary">{loadingMessage}</p>
        </div>
      )}

      {analysisResult && (
        <div className="mt-8 animate-fade-in">
          <ResultDisplay result={analysisResult} originalText="" />
        </div>
      )}
    </div>
  );
};

export default VideoDetector;
