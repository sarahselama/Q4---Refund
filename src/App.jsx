import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import RefundForm from './components/RefundForm'
import SuccessScreen from './components/SuccessScreen'
import SubmissionsPage from './components/SubmissionsPage'
import { useDarkMode } from './lib/useDarkMode'

export default function App() {
  const [view, setView] = useState('form')
  const [submitted, setSubmitted] = useState(null)
  const [dark, setDark] = useDarkMode()

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0f0f1e]">
      <Header
        view={view}
        setView={setView}
        dark={dark}
        onToggleDark={() => setDark((d) => !d)}
      />

      {view === 'submissions' && <SubmissionsPage />}
      {view === 'form' && (
        <RefundForm onSuccess={(data) => { setSubmitted(data); setView('success') }} />
      )}
      {view === 'success' && (
        <SuccessScreen
          submitted={submitted}
          onReset={() => { setSubmitted(null); setView('form') }}
        />
      )}

      <Footer />
    </div>
  )
}