import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { AlertTriangle, ExternalLink, RefreshCw, Loader2, Filter, Search, X, Download } from 'lucide-react'

function exportCSV(rows) {
    const today = new Date()
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const yyyy = today.getFullYear()
    const filename = `RefundRequests_${dd}${mm}${yyyy}.csv`

    const headers = ['Guest Name', 'Email', 'Booking Reference', 'Booking Date', 'Refund Reason', 'Additional Details', 'File Name', 'File URL', 'Outside Window', 'Submitted At']
    const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`

    const csvContent = [
        headers.join(','),
        ...rows.map((row) => [
            escape(row.full_name),
            escape(row.email),
            escape(row.booking_reference),
            escape(row.booking_date),
            escape(row.refund_reason),
            escape(row.additional_details),
            escape(row.file_name),
            escape(row.file_url),
            row.outside_window ? 'Yes' : 'No',
            escape(row.submitted_at),
        ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}

function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-AE', {
        year: 'numeric', month: 'short', day: 'numeric',
    })
}

function formatDateTime(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('en-AE', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

const REASON_COLORS = {
    'Property Issue': 'bg-red-50 text-red-700 border-red-200',
    'Booking Error': 'bg-orange-50 text-orange-700 border-orange-200',
    'Personal Reasons': 'bg-blue-50 text-blue-700 border-blue-200',
    'Other': 'bg-gray-50 text-gray-700 border-gray-200',
}

const REFUND_REASONS = ['Property Issue', 'Booking Error', 'Personal Reasons', 'Other']

function StatCard({ label, value, color }) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm px-5 py-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
        </div>
    )
}

function ImageLightbox({ url, onClose }) {
    useEffect(() => {
        const handler = (e) => e.key === 'Escape' && onClose()
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
                <X size={20} />
            </button>
            <img
                src={url}
                alt="attachment"
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    )
}

export default function SubmissionsPage({ onBack }) {
    const [submissions, setSubmissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [filterReason, setFilterReason] = useState('')
    const [filterWindow, setFilterWindow] = useState('')
    const [sortOrder, setSortOrder] = useState('desc')
    const [lightboxUrl, setLightboxUrl] = useState(null)

    async function fetchSubmissions() {
        setLoading(true)
        setError('')
        const { data, error } = await supabase
            .from('refund_requests')
            .select('*')
            .order('submitted_at', { ascending: false })
        if (error) setError('Failed to load submissions.')
        else setSubmissions(data || [])
        setLoading(false)
    }

    useEffect(() => { fetchSubmissions() }, [])

    const validSubmissions = submissions.filter((r) =>
        /^DLX-\d{5}$/.test(r.booking_reference)
    )

    const filtered = validSubmissions
        .filter((row) => {
            if (filterReason && row.refund_reason !== filterReason) return false
            if (filterWindow === 'outside' && !row.outside_window) return false
            if (filterWindow === 'within' && row.outside_window) return false
            if (search) {
                const q = search.toLowerCase()
                return (
                    row.full_name?.toLowerCase().includes(q) ||
                    row.email?.toLowerCase().includes(q) ||
                    row.booking_reference?.toLowerCase().includes(q)
                )
            }
            return true
        })
        .sort((a, b) => {
            const diff = new Date(a.submitted_at) - new Date(b.submitted_at)
            return sortOrder === 'desc' ? -diff : diff
        })

    const stats = {
        total: validSubmissions.length,
        outsideWindow: validSubmissions.filter((r) => r.outside_window).length,
        propertyIssue: validSubmissions.filter((r) => r.refund_reason === 'Property Issue').length,
        bookingError: validSubmissions.filter((r) => r.refund_reason === 'Booking Error').length,
        personal: validSubmissions.filter((r) => r.refund_reason === 'Personal Reasons').length,
    }

    const hasFilters = filterReason || filterWindow || search

    return (
        <main className="flex-1 px-4 py-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Refund Submissions
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            {filtered.length} of {validSubmissions.length} submission{validSubmissions.length !== 1 ? 's' : ''}
                            {hasFilters && ' (filtered)'} — pulled live from the database
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchSubmissions}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <RefreshCw size={14} /> Refresh
                        </button>
                        <button
                            onClick={() => exportCSV(filtered)}
                            disabled={filtered.length === 0}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                            style={{ backgroundColor: '#4ab9e6' }}
                        >
                            <Download size={14} /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
                    <StatCard label="Total" value={stats.total} color="#2d3666" />
                    <StatCard label="Outside Window" value={stats.outsideWindow} color="#f59e0b" />
                    <StatCard label="Property Issue" value={stats.propertyIssue} color="#dc2626" />
                    <StatCard label="Booking Error" value={stats.bookingError} color="#f97316" />
                    <StatCard label="Personal" value={stats.personal} color="#4ab9e6" />
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 shrink-0">
                            <Filter size={14} />
                            <span className="font-medium">Filter:</span>
                        </div>
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search name, email or booking ref..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="field-input pl-8"
                            />
                        </div>
                        <select
                            value={filterReason}
                            onChange={(e) => setFilterReason(e.target.value)}
                            className="field-input sm:max-w-44"
                        >
                            <option value="">All Reasons</option>
                            {REFUND_REASONS.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                        <select
                            value={filterWindow}
                            onChange={(e) => setFilterWindow(e.target.value)}
                            className="field-input sm:max-w-44"
                        >
                            <option value="">All Submissions</option>
                            <option value="outside">⚠️ Outside Window</option>
                            <option value="within">✅ Within Window</option>
                        </select>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="field-input sm:max-w-36"
                        >
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
                        {hasFilters && (
                            <button
                                onClick={() => { setSearch(''); setFilterReason(''); setFilterWindow('') }}
                                className="text-sm text-red-500 hover:underline shrink-0 self-center"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="animate-spin text-gray-400" size={32} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24 text-gray-400">
                        <p className="text-lg font-medium">No submissions found</p>
                        <p className="text-sm mt-1">
                            {validSubmissions.length === 0 ? 'No submissions yet' : 'Try adjusting your filters'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/60 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr style={{ backgroundColor: '#2d3666' }}>
                                        {['Guest Name', 'Email', 'Booking Ref', 'Booking Date', 'Reason', 'Details', 'Document', 'Submitted At'].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {filtered.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                                {row.full_name}
                                                {row.outside_window && (
                                                    <span title="Outside 90-day refund window">
                                                        <AlertTriangle size={13} className="inline ml-2 text-amber-500" />
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                {row.email}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300">
                                                {row.booking_reference}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {formatDate(row.booking_date)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${REASON_COLORS[row.refund_reason] || REASON_COLORS['Other']}`}>
                                                    {row.refund_reason}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs">
                                                <p className="truncate" title={row.additional_details}>
                                                    {row.additional_details}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                {row.file_url ? (
                                                    row.file_name?.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i) ? (
                                                        <img
                                                            src={row.file_url}
                                                            alt="attachment"
                                                            onClick={() => setLightboxUrl(row.file_url)}
                                                            className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform cursor-zoom-in"
                                                        />
                                                    ) : (
                                                        <a
                                                            href={row.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs"
                                                        >
                                                            {row.file_name?.match(/\.(doc|docx)$/i) ? '📄 Word Doc' : 'View'}
                                                            <ExternalLink size={11} />
                                                        </a>
                                                    )
                                                ) : (
                                                    <span className="text-gray-400 text-xs">None</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                                                {formatDateTime(row.submitted_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {lightboxUrl && (
                <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
            )}
        </main>
    )
}