"use client";

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UploadStepProps {
  data: {
    attachments: Array<{
      fileName: string;
      originalName: string;
      publicUrl: string;
      size: number;
      mimeType: string;
      uploadedAt: string;
      file?: File;
    }>;
  };
  onChange: (data: any) => void;
  errors: Record<string, string>;
  jobId?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif'
];

export default function UploadStep({ data, onChange, errors }: UploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`;
    }
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'File type not supported. Please upload PDF, Word, text, or image files.';
    }
    
    return null;
  };

  const handleFileSelect = useCallback(async (files: FileList) => {
    const newAttachments = [...(data.attachments || [])];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = validateFile(file);
      
      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }

      // Check if file already exists
      const exists = newAttachments.some(att => 
        att.originalName === file.name && att.size === file.size
      );
      
      if (exists) {
        toast.error(`${file.name} is already uploaded`);
        continue;
      }

      // Add file as draft attachment
      const attachment = {
        fileName: `${Date.now()}-${file.name}`,
        originalName: file.name,
        publicUrl: '', // Will be set after upload
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        file: file // Keep file object for later upload
      };

      newAttachments.push(attachment);
    }

    onChange({ attachments: newAttachments });
  }, [data.attachments, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeAttachment = useCallback((index: number) => {
    const newAttachments = [...(data.attachments || [])];
    newAttachments.splice(index, 1);
    onChange({ attachments: newAttachments });
  }, [data.attachments, onChange]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileSelect(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium text-gray-700">
          Supporting Documents
        </Label>
        <p className="mt-1 text-sm text-gray-500">
          Upload any supporting documents like company brochures, job descriptions, or additional information (optional)
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Drop files here or click to upload
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Supports: PDF, Word, Text, and Image files (max {formatFileSize(MAX_FILE_SIZE)})
        </p>
        
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
          onChange={handleFileInputChange}
          className="hidden"
          id="file-upload"
        />
        
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Choose Files'}
        </Button>
      </div>

      {/* File List */}
      {data.attachments && data.attachments.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Uploaded Files ({data.attachments.length})
          </Label>
          
          <div className="space-y-2">
            {data.attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  <File className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {attachment.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)} • {attachment.mimeType}
                    </p>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {errors.attachments && (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{errors.attachments}</p>
        </div>
      )}

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-purple-900 mb-2">💡 Document Upload Tips:</h4>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Company brochures help candidates understand your culture</li>
          <li>• Detailed job descriptions can supplement the main description</li>
          <li>• Team photos or office images make positions more appealing</li>
          <li>• Keep file sizes reasonable for faster loading</li>
        </ul>
      </div>
    </div>
  );
}
