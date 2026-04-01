export default function SummaryRow({ label, value, multiline }) {
  return (
    <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide sm:w-40 shrink-0">
        {label}
      </span>
      <span
        className={`text-sm text-gray-800 font-medium ${
          multiline ? 'whitespace-pre-wrap' : ''
        }`}
      >
        {value || '—'}
      </span>
    </div>
  )
}
