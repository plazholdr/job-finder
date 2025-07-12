"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
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
    }>;
  };
  onChange: (data: any) => void;
  errors: Record<string, string>;
  jobId?: string; // Job ID for uploading files
}

export default function UploadStep({ data, onChange, errors, jobId }: UploadStepProps) {
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.');
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    if (!jobId) {
      // If no jobId, just add to local state (for draft jobs)
      const fileData = {
        fileName: file.name,
        originalName: file.name,
        publicUrl: '', // Will be set after job creation
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        file: file // Store file object for later upload
      };

      onChange({
        attachments: [...(data.attachments || []), fileData]
      });
      
      toast.success('File added to job listing');
      return;
    }

    // Upload file to server
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/jobs/${jobId}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const uploadedFile = await response.json();
      
      // Add uploaded file to attachments
      const currentAttachments = data.attachments || [];
      onChange({
        attachments: [...currentAttachments, uploadedFile]
      });

      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = async (fileName: string) => {
    if (!jobId) {
      // Remove from local state
      onChange({
        attachments: (data.attachments || []).filter(file => file.fileName !== fileName)
      });
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}/attachments/${fileName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove file');
      }

      // Remove from local state
      onChange({
        attachments: (data.attachments || []).filter(file => file.fileName !== fileName)
      });

      toast.success('File removed successfully');
    } catch (error) {
      console.error('Remove file error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove file');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium text-gray-700">
          Supporting Documents
        </Label>
        <p className="mt-1 text-sm text-gray-500">
          Upload additional documents like job descriptions, company information, or application forms (optional)
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mb-2"
              >
                {uploading ? 'Uploading...' : 'Choose File'}
              </Button>
              <p className="text-sm text-gray-500">
                or drag and drop
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              PDF, DOC, DOCX, TXT up to 10MB
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* File List */}
      {data.attachments && data.attachments.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Uploaded Files ({data.attachments.length})
          </Label>
          
          {data.attachments.map((file, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <File className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {file.publicUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(file.publicUrl, '_blank')}
                    >
                      View
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFile(file.fileName)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {errors.attachments && (
        <p className="text-sm text-red-600">{errors.attachments}</p>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">File Upload Tips:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Upload detailed job descriptions or company brochures</li>
              <li>• Include application forms or assessment instructions</li>
              <li>• Add company culture documents or team information</li>
              <li>• Files will be available to candidates when they view the job</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
