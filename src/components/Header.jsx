export default function Header({ onViewSubmissions }) {
  return (
    <header
      className="w-full px-6 py-4 flex items-center justify-between shadow-sm"
      style={{ backgroundColor: '#2d3666' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: '#4ab9e6', color: '#ffffff' }}
        >
          DH
        </div>
        <div>
          <span className="text-white font-semibold text-sm">Deluxe Holiday Homes</span>
          <span className="text-gray-400 text-xs ml-2">Guest Services</span>
        </div>
      </div>
      {onViewSubmissions && (
        <button
          onClick={onViewSubmissions}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          View All Submissions
        </button>
      )}
    </header>
  )
}