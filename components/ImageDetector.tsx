import React, { useState, useCallback } from 'react';
import FileInput from './FileInput';
import ResultDisplay from './ResultDisplay';
import { analyzeImage } from '../services/geminiService';
import type { AnalysisResult } from '../types';
import Spinner from './Spinner';
import { fileToBase64 } from '../utils/fileUtils';

const ImageDetector: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    setImageFile(file);
    setAnalysisResult(null);
    setError(null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!imageFile) {
      setError('Please select an image file to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const base64Image = await fileToBase64(imageFile);
      const result = await analyzeImage(base64Image, imageFile.type);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze the image. The model may not support this file type or the request failed. Please try another image.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  return (
    <div className="animate-fade-in space-y-6">
      <FileInput
        onFileChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        label="Image File"
        disabled={isLoading}
      />
      
      {imagePreview && (
        <div className="bg-dark-card p-4 rounded-lg border border-gray-700">
            <h3 className="text-lg font-medium text-dark-text mb-2">Image Preview</h3>
            <img src={imagePreview} alt="Preview" className="max-w-full max-h-96 mx-auto rounded-md" />
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleAnalyze}
          disabled={isLoading || !imageFile}
          className="px-6 py-3 bg-brand-primary text-white font-bold rounded-md hover:bg-brand-secondary disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Image'}
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
          <p className="mt-4 text-dark-text-secondary">Analyzing image... this may take a moment.</p>
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

export default ImageDetector;
