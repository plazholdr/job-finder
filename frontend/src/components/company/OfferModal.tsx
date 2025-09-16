'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Upload,
  FileText,
  X,
  AlertCircle,
  CheckCircle,
  Calendar,
  Loader2
} from 'lucide-react';

import { APPLICATION_STATUS } from '@/constants/constants';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  candidateName: string;
  onSuccess: () => void;
}

export default function OfferModal({
  isOpen,
  onClose,
  applicationId,
  candidateName,
  onSuccess
}: OfferModalProps) {
  const [offerValidity, setOfferValidity] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed for offer letters');
        return;
      }

      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('File size exceeds 10MB limit');
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const validateForm = (): boolean => {
    if (!offerValidity) {
      setError('Offer validity date is required');
      return false;
    }

    const validityDate = new Date(offerValidity);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (validityDate <= today) {
      setError('Offer validity date must be in the future');
      return false;
    }

    if (!selectedFile) {
      setError('Offer letter PDF is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('authToken');

      // Convert file to base64
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile!);
      });

      const requestData = {
        status: APPLICATION_STATUS.PENDING_ACCEPTANCE,
        offerValidity: offerValidity,
        offerLetter: {
          data: fileBase64,
          name: selectedFile!.name,
          type: selectedFile!.type
        }
      };

      console.log('Sending offer data:', requestData);

      const response = await fetch(`/api/company/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Offer submitted successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
          resetForm();
        }, 1500);
      } else {
        setError(result.error || 'Failed to submit offer');
      }
    } catch (error) {
      console.error('Error submitting offer:', error);
      setError('Failed to submit offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setOfferValidity('');
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Submit Offer to {candidateName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Offer Validity Date */}
          <div className="space-y-2">
            <Label htmlFor="offerValidity" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Offer Validity Date
            </Label>
            <Input
              id="offerValidity"
              type="date"
              value={offerValidity}
              onChange={(e) => setOfferValidity(e.target.value)}
              min={getMinDate()}
              disabled={isSubmitting}
              className="w-full"
            />
            <p className="text-sm text-gray-500">
              The date until which this offer is valid
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Offer Letter (PDF)
            </Label>

            {!selectedFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to upload offer letter
                </p>
                <p className="text-xs text-gray-500">
                  PDF files only, max 10MB
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  disabled={isSubmitting}
                  className="hidden"
                  id="offer-letter-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('offer-letter-upload')?.click()}
                  disabled={isSubmitting}
                  className="mt-2"
                >
                  Choose File
                </Button>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !offerValidity || !selectedFile}
            className="flex items-center"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isSubmitting ? 'Submitting...' : 'Submit Offer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
