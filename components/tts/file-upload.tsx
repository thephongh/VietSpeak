'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { cn, formatFileSize } from '@/lib/utils';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  onTextExtracted?: (text: string) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  className?: string;
  description?: string;
}

export function FileUpload({
  onFilesSelect,
  onTextExtracted,
  accept = 'audio/*,.txt,.docx,.pdf',
  multiple = true,
  maxSize = 25 * 1024 * 1024, // 25MB
  maxFiles = 5,
  className,
  description = 'Drag and drop files here, or click to select',
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File "${file.name}" is too large. Maximum size is ${formatFileSize(maxSize)}.`;
    }

    // Validate file type based on accept prop
    if (accept.includes('audio/*') && file.type.startsWith('audio/')) {
      return null;
    }
    
    if (accept.includes('.txt') && file.type === 'text/plain') {
      return null;
    }
    
    if (accept.includes('.pdf') && file.type === 'application/pdf') {
      return null;
    }
    
    if (accept.includes('.docx') && 
        (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
         file.name.endsWith('.docx'))) {
      return null;
    }

    return `File "${file.name}" has an unsupported format.`;
  };

  const processFiles = useCallback((files: FileList) => {
    setError('');
    const fileArray = Array.from(files);
    
    if (fileArray.length > maxFiles) {
      setError(`Too many files. Maximum ${maxFiles} files allowed.`);
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      setError(errors.join(' '));
      return;
    }

    setSelectedFiles(validFiles);
    onFilesSelect(validFiles);

    // Extract text if it's a text file
    if (validFiles.length === 1 && validFiles[0].type === 'text/plain' && onTextExtracted) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onTextExtracted(text);
      };
      reader.readAsText(validFiles[0]);
    }
  }, [maxFiles, maxSize, onFilesSelect, onTextExtracted]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelect(newFiles);
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setError('');
    onFilesSelect([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Card
        className={cn(
          'glass-card border-2 border-dashed transition-all duration-300 cursor-pointer',
          isDragOver 
            ? 'border-red-400 bg-red-50/50' 
            : 'border-gray-300 hover:border-red-300',
          error && 'border-red-400'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <CardContent className="p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className={cn(
                'h-12 w-12 transition-colors',
                isDragOver ? 'text-red-500' : 'text-gray-400'
              )} />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-700">
                {description}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Support for audio files (MP3, WAV, FLAC) and text files
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Max {maxFiles} files, up to {formatFileSize(maxSize)} each
              </p>
            </div>
            
            <Button
              variant="vietnam"
              className="btn-apple"
              type="button"
            >
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-800">
                Selected Files ({selectedFiles.length})
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear All
              </Button>
            </div>
            
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}