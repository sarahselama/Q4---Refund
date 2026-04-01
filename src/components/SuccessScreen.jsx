import { CheckCircle2, AlertTriangle } from 'lucide-react'
import SummaryRow from './SummaryRow'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-AE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function SuccessScreen({ submitted, onReset }) {
  return (
    <main className="flex-1 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-2xl">

        {/* Success banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-4 mb-6">
          <CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={28} />
          <div>
            <h2 className="text-lg font-semibold text-emerald-800">
              Refund Request Submitted
            </h2>
            <p className="text-sm text-emerald-700 mt-1">
              Your request has been received and logged. Our team will review it
              within 3–5 business days and contact you at{' '}
              <strong>{submitted.email}</strong>.
            </p>
          </div>
        </div>

        {/* Outside-window notice */}
        {submitted.outsideWindow && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 mb-6">
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-amber-800">
              Your booking is outside the standard refund window. Your request
              will be reviewed on a case-by-case basis.
            </p>
          </div>
        )}

        {/* Submission summary card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
          <div className="px-6 py-4" style={{ backgroundColor: '#2d3666' }}>
            <h3 className="text-white font-semibold text-base">
              Submission Summary
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">
              Reference: #{submitted.bookingReference}
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            <SummaryRow label="Full Name"           value={submitted.fullName} />
            <SummaryRow label="Email Address"       value={submitted.email} />
            <SummaryRow label="Booking Reference"   value={submitted.bookingReference} />
            <SummaryRow label="Booking Date"        value={formatDate(submitted.bookingDate)} />
            <SummaryRow label="Refund Reason"       value={submitted.refundReason} />
            <SummaryRow label="Additional Details"  value={submitted.additionalDetails} multiline />
            <SummaryRow label="Supporting Document" value={submitted.fileName || 'None provided'} />
          </div>
        </div>

        <button
          onClick={onReset}
          className="mt-6 w-full py-3 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Submit Another Request
        </button>
      </div>
    </main>
  )
}
