import { Moon, Sun } from 'lucide-react'

export default function Header({ view, setView, dark, onToggleDark }) {
  return (
    <header
      className="w-full px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm"
      style={{ backgroundColor: '#2d3666' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div
          className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: '#4ab9e6', color: '#ffffff' }}
        >
          DH
        </div>
        <div className="min-w-0">
          <span className="text-white font-semibold text-sm truncate">
            <span className="hidden sm:inline">Deluxe Holiday Homes</span>
            <span className="sm:hidden">DH Homes</span>
          </span>
          <span className="hidden sm:inline text-gray-400 text-xs ml-2">Guest Services</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Tab toggle — hidden on success screen */}
        {view !== 'success' && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setView('form')}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-150 ${
                view === 'form'
                  ? 'text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
              style={view === 'form' ? { backgroundColor: '#4ab9e6' } : {}}
            >
              Form
            </button>
            <button
              onClick={() => setView('submissions')}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-150 ${
                view === 'submissions'
                  ? 'text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
              style={view === 'submissions' ? { backgroundColor: '#4ab9e6' } : {}}
            >
              Dashboard
            </button>
          </div>
        )}

        <button
          onClick={onToggleDark}
          className="p-1.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
          title={dark ? 'Light mode' : 'Dark mode'}
        >
          {dark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </header>
  )
}