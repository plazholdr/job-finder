"use client";

import React, { useEffect, useState } from "react";
import { X, AlertCircle, MessageSquare, Loader2 } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void; // allow async
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
  requireReason?: boolean; // default false
};

export default function WithdrawalReasonModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Withdraw Application",
  subtitle = "This action can’t be undone. You can include a brief reason (optional) for the company.",
  confirmLabel = "Withdraw Application",
  requireReason = false,
}: Props) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const disabled =
    submitting || (requireReason && reason.trim().length === 0);

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await onConfirm(reason.trim());
      setSubmitting(false);
      onClose();
    } catch (e) {
      // Let parent handle errors if needed, but don’t get stuck loading
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b p-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-5">
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">
              Withdrawing will remove your application from consideration.
            </p>
          </div>

          <label className="block text-sm font-medium text-gray-700">
            Reason (optional)
          </label>
          <div className="relative">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              placeholder="e.g. I’ve accepted another opportunity / my availability has changed / role is no longer a fit..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              maxLength={500}
            />
            <MessageSquare className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Tip: keep it courteous and brief.</span>
            <span>{reason.length}/500</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t bg-gray-50 p-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={disabled}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white ${
              disabled
                ? "cursor-not-allowed bg-red-300"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
