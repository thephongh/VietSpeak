'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadProps {
  onTextExtracted: (text: string) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
}

export function FileUpload({ 
  onTextExtracted, 
  acceptedTypes = ['.txt', '.md', '.rtf'],
  maxFileSize = 5 
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    setError('');
    
    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      setError(`Unsupported file type. Please upload: ${acceptedTypes.join(', ')}`);
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      setError(`File too large. Maximum size: ${maxFileSize}MB`);
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);
    setUploadedFile(file);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Read file content
      const text = await readFileAsText(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Clean up the text (basic cleanup)
      const cleanedText = text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trim();
      
      setTimeout(() => {
        onTextExtracted(cleanedText);
        setIsProcessing(false);
        setUploadProgress(0);
      }, 500);

    } catch (err) {
      setError('Failed to read file. Please try again.');
      setIsProcessing(false);
      setUploadProgress(0);
      setUploadedFile(null);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file, 'utf-8');
    });
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Card 
        className={`border-2 border-dashed transition-colors ${
          isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        } ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Upload Text File
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop a file here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Supported formats: {acceptedTypes.join(', ')} (max {maxFileSize}MB)
          </p>
          <Button onClick={handleBrowseClick} variant="outline">
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      {isProcessing && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Processing: {uploadedFile?.name}
                </p>
                <Progress value={uploadProgress} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {uploadedFile && !isProcessing && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm font-medium">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRemoveFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="text-red-600 p-3 bg-red-50 rounded-md text-sm">
          {error}
        </div>
      )}
    </div>
  );
}