import { useState, useRef } from 'react'
import { AlertTriangle, Upload, X, FileText, ChevronDown, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { isOutside90Days, validateForm } from '../lib/utils'

const REFUND_REASONS = [
  'Property Issue',
  'Booking Error',
  'Personal Reasons',
  'Other',
]

const INITIAL_FORM = {
  fullName: '',
  email: '',
  bookingReference: '',
  bookingDate: '',
  refundReason: '',
  additionalDetails: '',
}

export default function RefundForm({ onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const fileInputRef = useRef(null)

  const showWarning = isOutside90Days(form.bookingDate)

  function handleChange(field, value) {
    if (field === 'bookingReference') value = value.toUpperCase()
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function handleBlur(field) {
    const validationErrors = validateForm(form)
    setErrors((prev) => {
      const newErrors = { ...prev }
      if (validationErrors[field]) newErrors[field] = validationErrors[field]
      else delete newErrors[field]
      return newErrors
    })
  }

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setFilePreview(f.type.startsWith('image/') ? URL.createObjectURL(f) : null)
  }

  function removeFile() {
    setFile(null)
    setFilePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')

    const validationErrors = validateForm(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      document.querySelector('[data-error="true"]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSubmitting(true)
    try {
      let fileUrl = null
      let fileName = null

      if (file) {
        const ext = file.name.split('.').pop()
        const path = `refunds/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage.from('uploads').upload(path, file)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path)
        fileUrl = urlData.publicUrl
        fileName = file.name
      }

      const { error: dbError } = await supabase.from('refund_requests').insert({
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        booking_reference: form.bookingReference.trim(),
        booking_date: form.bookingDate,
        refund_reason: form.refundReason,
        additional_details: form.additionalDetails.trim(),
        file_url: fileUrl,
        file_name: fileName,
        outside_window: showWarning,
        submitted_at: new Date().toISOString(),
      })

      if (dbError) throw dbError
      onSuccess({ ...form, fileUrl, fileName, outsideWindow: showWarning })

    } catch (err) {
      console.error('Submission error:', err)
      setSubmitError('Something went wrong. Please try again or contact support.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex-1 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-2xl">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#2d3666] dark:text-white">
            Guest Refund Request
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
            Please complete all fields. Our team will respond within 3–5 business days.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/60 dark:shadow-none border border-gray-100 dark:border-gray-800 p-6 sm:p-8 space-y-6">

            {/* Full Name */}
            <Field label="Full Name" required error={errors.fullName}>
              <input
                type="text"
                placeholder="e.g. Ahmed Al Mansoori"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                className={`field-input ${errors.fullName ? 'border-red-400 focus:ring-red-300' : ''}`}
                data-error={!!errors.fullName}
              />
            </Field>

            {/* Email */}
            <Field label="Email Address" required error={errors.email}>
              <input
                type="email"
                placeholder="e.g. ahmed@email.com"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`field-input ${errors.email ? 'border-red-400 focus:ring-red-300' : ''}`}
              />
            </Field>

            {/* Booking Reference */}
            <Field label="Booking Reference" required error={errors.bookingReference}>
              <div className={`flex items-center w-full rounded-xl border bg-slate-50 dark:bg-gray-800 focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:ring-4 focus-within:ring-[#4ab9e6]/20 focus-within:border-[#4ab9e6] transition-all duration-200 overflow-hidden ${errors.bookingReference ? 'border-red-400 focus-within:ring-red-300' : 'border-slate-200 dark:border-gray-700'}`}>
                <span className="pl-4 pr-0.5 mt-[1px] text-slate-500 dark:text-gray-400 font-medium text-sm select-none">
                  DLX-
                </span>
                <input
                  type="text"
                  placeholder="12345"
                  maxLength={5}
                  value={form.bookingReference.replace(/^DLX-/i, '')}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/[^0-9]/g, '')
                    handleChange('bookingReference', digits ? 'DLX-' + digits : '')
                  }}
                  onBlur={() => handleBlur('bookingReference')}
                  className="w-full py-3 pr-4 bg-transparent text-gray-900 dark:text-gray-100 text-sm placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none"
                />
              </div>
            </Field>

            {/* Booking Date */}
            <Field label="Booking Date" required error={errors.bookingDate}>
              <input
                type="date"
                value={form.bookingDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => handleChange('bookingDate', e.target.value)}
                onBlur={() => handleBlur('bookingDate')}
                className={`field-input ${errors.bookingDate ? 'border-red-400 focus:ring-red-300' : ''}`}
              />
              {showWarning && (
                <div className="mt-3 flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3">
                  <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-amber-800 leading-snug">
                    <strong>Outside refund window.</strong> Your booking is older than
                    90 days. Your request will be reviewed on a case-by-case basis.
                  </p>
                </div>
              )}
            </Field>

            {/* Refund Reason */}
            <Field label="Refund Reason" required error={errors.refundReason}>
              <div className="relative">
                <select
                  value={form.refundReason}
                  onChange={(e) => handleChange('refundReason', e.target.value)}
                  onBlur={() => handleBlur('refundReason')}
                  className={`field-input appearance-none pr-10 ${errors.refundReason ? 'border-red-400 focus:ring-red-300' : ''}`}
                >
                  <option value="">Select a reason...</option>
                  {REFUND_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={16}
                />
              </div>
            </Field>

            {/* Additional Details */}
            <Field label="Additional Details" required error={errors.additionalDetails}>
              <textarea
                rows={4}
                placeholder="Please describe the issue and why you are requesting a refund..."
                value={form.additionalDetails}
                onChange={(e) => handleChange('additionalDetails', e.target.value)}
                onBlur={() => handleBlur('additionalDetails')}
                className={`field-input resize-none ${errors.additionalDetails ? 'border-red-400 focus:ring-red-300' : ''}`}
              />
            </Field>

            {/* File Upload */}
            <Field label="Supporting Documents" hint="optional">
              {!file ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 dark:border-gray-700 rounded-xl cursor-pointer bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors">
                  <Upload className="text-[#4ab9e6] mb-2" size={24} />
                  <span className="text-sm text-slate-500 dark:text-gray-400">
                    Click to upload a photo or document
                  </span>
                  <span className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                    JPG, PNG, PDF, DOCX up to 10MB
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFile}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center gap-3 p-4 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800">
                  {filePreview ? (
                    <img src={filePreview} alt="preview" className="w-12 h-12 object-cover rounded-lg" />
                  ) : (
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <FileText className="text-blue-400" size={24} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Remove file"
                  >
                    <X size={16} className="text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              )}
            </Field>

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-[#4ab9e6]/30 hover:shadow-[#4ab9e6]/50 hover:-translate-y-0.5"
              style={{ backgroundColor: '#4ab9e6' }}
            >
              {submitting
                ? <><Loader2 className="animate-spin" size={16} /> Submitting...</>
                : 'Submit Refund Request'
              }
            </button>

            <p className="text-center text-xs text-gray-400 dark:text-gray-500">
              By submitting, you confirm the details above are accurate.
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}

function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="field-label">
        {label}{' '}
        {required && <span className="text-red-400">*</span>}
        {hint && <span className="text-gray-400 font-normal">({hint})</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}