'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileType, CheckCircle2, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  label?: string;
  description?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelected,
  acceptedTypes = ['.pdf', '.xlsx', '.xls', '.txt'],
  maxSizeMB = 25,
  label = 'Upload Tender or BoQ Schedule',
  description = 'Drag and drop PDF RFP document or Excel BoQ spreadsheet (up to 25 MB)',
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const validateAndSelect = (file: File) => {
    setError(null);
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(ext)) {
      setError(`Unsupported format (${ext}). Allowed: ${acceptedTypes.join(', ')}`);
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB} MB limit.`);
      return;
    }
    setSelectedFile(file);
    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 transition flex flex-col items-center justify-center text-center ${
          dragOver
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-slate-700/80 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-600'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              validateAndSelect(e.target.files[0]);
            }
          }}
        />

        <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 text-emerald-400">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h4 className="text-base font-semibold text-white">{label}</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">{description}</p>

        {selectedFile && (
          <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">{selectedFile.name}</span>
            <span className="text-slate-400 font-mono">
              ({(selectedFile.size / 1024).toFixed(1)} KB)
            </span>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
