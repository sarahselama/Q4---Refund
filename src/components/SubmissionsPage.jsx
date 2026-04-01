import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { AlertTriangle, ExternalLink, RefreshCw, Loader2 } from 'lucide-react'

function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-AE', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDateTime(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('en-AE', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const REASON_COLORS = {
    'Property Issue': 'bg-red-50 text-red-700 border-red-200',
    'Booking Error': 'bg-orange-50 text-orange-700 border-orange-200',
    'Personal Reasons': 'bg-blue-50 text-blue-700 border-blue-200',
    'Other': 'bg-gray-50 text-gray-700 border-gray-200',
}

export default function SubmissionsPage({ onBack }) {
    const [submissions, setSubmissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

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

    return (
        <main className="flex-1 px-4 py-10">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Refund Submissions</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {submissions.length} total submission{submissions.length !== 1 ? 's' : ''} — pulled live from the database
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={fetchSubmissions} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                            <RefreshCw size={14} /> Refresh
                        </button>
                        <button onClick={onBack} className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors" style={{ backgroundColor: '#2d3666' }}>
                            ← Back to Form
                        </button>
                    </div>
                </div>

                {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-6">{error}</div>}

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="animate-spin text-gray-400" size={32} />
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="text-center py-24 text-gray-400">
                        <p className="text-lg font-medium">No submissions yet</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr style={{ backgroundColor: '#2d3666' }}>
                                        {['Guest Name', 'Email', 'Booking Ref', 'Booking Date', 'Reason', 'Details', 'Document', 'Submitted At'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {submissions.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                                                {row.full_name}
                                                {row.outside_window && <AlertTriangle size={13} className="inline ml-2 text-amber-500" />}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{row.email}</td>
                                            <td className="px-4 py-3 font-mono text-gray-700">{row.booking_reference}</td>
                                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(row.booking_date)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${REASON_COLORS[row.refund_reason] || REASON_COLORS['Other']}`}>
                                                    {row.refund_reason}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 max-w-xs">
                                                <p className="truncate" title={row.additional_details}>{row.additional_details}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                {row.file_url
                                                    ? <a href={row.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs">View <ExternalLink size={11} /></a>
                                                    : <span className="text-gray-400 text-xs">None</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{formatDateTime(row.submitted_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}