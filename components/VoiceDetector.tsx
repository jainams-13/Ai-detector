import React, { useState, useCallback, useRef } from 'react';
import FileInput from './FileInput';
import ResultDisplay from './ResultDisplay';
import { analyzeAudio } from '../services/geminiService';
import type { AnalysisResult } from '../types';
import Spinner from './Spinner';
import { fileToBase64 } from '../utils/fileUtils';

type RecordingStatus = 'idle' | 'recording' | 'finished';

const VoiceDetector: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const resetState = () => {
    setAnalysisResult(null);
    setError(null);
    setAudioFile(null);
    setAudioPreview(null);
    setRecordingStatus('idle');
  };

  const handleFileChange = (file: File | null) => {
    resetState();
    setAudioFile(file);
    if (file) {
      setAudioPreview(URL.createObjectURL(file));
    }
  };

  const handleStartRecording = async () => {
    resetState();
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const newAudioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
          setAudioFile(newAudioFile);
          setAudioPreview(audioUrl);
          setRecordingStatus('finished');
           // Stop all tracks to release the microphone
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setRecordingStatus('recording');
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setError("Microphone access was denied. Please allow microphone permissions in your browser settings.");
      }
    } else {
      setError("Audio recording is not supported by your browser.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!audioFile) {
      setError('Please select or record an audio file to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const base64Audio = await fileToBase64(audioFile);
      const result = await analyzeAudio(base64Audio, audioFile.type);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze the audio. The model may not support this file type or the request failed. Please try another audio file.');
    } finally {
      setIsLoading(false);
    }
  }, [audioFile]);

  const isRecording = recordingStatus === 'recording';
  const canAnalyze = !!audioFile && !isLoading;

  return (
    <div className="animate-fade-in space-y-6">
      <FileInput
        onFileChange={handleFileChange}
        accept="audio/mpeg, audio/wav, audio/ogg, audio/webm"
        label="Audio File"
        disabled={isLoading || isRecording}
      />
      
      <div className="bg-dark-card p-6 rounded-lg shadow-lg border border-gray-700">
         <h3 className="text-lg font-medium text-dark-text mb-4">Or Record with Microphone</h3>
         <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={isLoading}
          className={`w-full px-6 py-3 font-bold rounded-md transition-all duration-300 flex items-center justify-center space-x-2 disabled:bg-gray-500 ${
            isRecording ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-brand-primary hover:bg-brand-secondary text-white'
          }`}
        >
          {isRecording ? (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-300"></span>
              </span>
              <span>Stop Recording</span>
            </>
          ) : (
             <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 008-8h-2a6 6 0 01-12 0H2a8 8 0 008 8z" clipRule="evenodd" />
              </svg>
              <span>{recordingStatus === 'finished' ? 'Record Again' : 'Start Recording'}</span>
            </>
          )}
        </button>
      </div>
      
      {audioPreview && (
        <div className="bg-dark-card p-4 rounded-lg border border-gray-700">
            <h3 className="text-lg font-medium text-dark-text mb-2">Audio Preview</h3>
            <audio src={audioPreview} controls className="w-full" />
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className="px-6 py-3 bg-brand-primary text-white font-bold rounded-md hover:bg-brand-secondary disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Voice'}
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
          <p className="mt-4 text-dark-text-secondary">Analyzing audio... this may take a moment.</p>
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

export default VoiceDetector;