"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Mail, Phone, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CompanyPendingApprovalPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-50 p-4">
      <motion.div
        className="w-full max-w-md space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Pending Approval
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Your company registration is under review
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-medium">Application submitted successfully!</p>
              <p>Your company information and Superform have been received.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-medium">Under admin review</p>
              <p>Our team is reviewing your company registration details.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-medium">Email notification</p>
              <p>You'll receive an email once your application is approved or if additional information is needed.</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Building className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">What happens next?</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Admin reviews your company information</li>
                <li>Superform document is verified</li>
                <li>Company registration number is validated</li>
                <li>Approval email is sent to you</li>
                <li>You can then login and start posting jobs</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Need help or have questions?
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>Contact support: +60 3-1234 5678</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-1">
              <Mail className="h-4 w-4" />
              <span>Email: support@jobfinder.com</span>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={() => router.push('/auth/login')}
              variant="outline"
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Approval Timeline</p>
            <p>Company registrations are typically reviewed within 1-3 business days. You'll be notified via email once the review is complete.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
