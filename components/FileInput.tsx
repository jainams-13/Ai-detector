import React, { useState, useCallback } from 'react';

interface FileInputProps {
  onFileChange: (file: File | null) => void;
  accept: string;
  label: string;
  disabled: boolean;
}

const FileInput: React.FC<FileInputProps> = ({ onFileChange, accept, label, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback((file: File | undefined) => {
    if (file && accept.includes(file.type)) {
      setFileName(file.name);
      onFileChange(file);
    } else {
      setFileName(null);
      onFileChange(null);
      // Optional: show an error for invalid file type
    }
  }, [accept, onFileChange]);

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    handleFile(e.dataTransfer.files?.[0]);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
  };

  const borderColor = disabled ? 'border-gray-600' : isDragging ? 'border-brand-primary' : 'border-gray-500';
  const bgColor = disabled ? 'bg-gray-800' : isDragging ? 'bg-brand-primary/10' : 'bg-dark-card';

  return (
    <div className={`p-6 rounded-lg shadow-lg border ${bgColor}`}>
      <label htmlFor="file-upload" className="block text-lg font-medium text-dark-text mb-4">
        Select or Drop {label}
      </label>
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center w-full h-48 border-2 ${borderColor} border-dashed rounded-lg cursor-pointer transition-colors duration-200`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V16a4 4 0 01-4 4H7z"></path></svg>
          {fileName ? (
             <p className="font-semibold text-brand-light">{fileName}</p>
          ) : (
            <>
              <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              {/* Fix: Replaced `replaceAll` with `replace` using a global regex to fix compatibility error. */}
              <p className="text-xs text-gray-500">Supported types: {accept.replace(/image\/|video\/|audio\//g, '.').replace(/,/g, ', ')}</p>
            </>
          )}
        </div>
        <input id="file-upload" type="file" className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" accept={accept} onChange={onFileSelect} disabled={disabled} />
      </div>
    </div>
  );
};

export default FileInput;