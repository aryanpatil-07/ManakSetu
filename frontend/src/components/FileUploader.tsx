'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileType, CheckCircle2, AlertCircle, FileSpreadsheet, FileText } from 'lucide-react';

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
      setError(`Unsupported file extension (${ext}). Supported formats: ${acceptedTypes.join(', ')}`);
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds maximum allowable limit (${maxSizeMB} MB).`);
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
        className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-8 md:p-10 transition-all duration-300 flex flex-col items-center justify-center text-center ${
          dragOver
            ? 'border-accent-cyan bg-accent-blue/15 shadow-cyan-glow scale-[1.01]'
            : 'border-slate-800 bg-canvas-900/60 hover:bg-canvas-900/90 hover:border-slate-700'
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

        {/* Central Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue/20 via-canvas-950 to-accent-cyan/20 border border-accent-sky/30 flex items-center justify-center mb-4 text-accent-cyan shadow-lg shadow-accent-blue/10">
          <UploadCloud className="w-8 h-8" />
        </div>

        {/* Text Details */}
        <h4 className="text-lg font-black text-white">{label}</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-md leading-relaxed">{description}</p>

        {/* Accepted Formats Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          {acceptedTypes.map((type) => (
            <span
              key={type}
              className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
            >
              {type.replace('.', '')}
            </span>
          ))}
        </div>

        {/* Selected File Badge */}
        {selectedFile && (
          <div className="mt-5 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{selectedFile.name}</span>
            <span className="text-emerald-400/80 font-mono">
              ({(selectedFile.size / 1024).toFixed(1)} KB)
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-5 flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
