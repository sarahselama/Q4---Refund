import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import RefundForm from './components/RefundForm'
import SuccessScreen from './components/SuccessScreen'
import SubmissionsPage from './components/SubmissionsPage'

export default function App() {
  const [view, setView] = useState('form')
  const [submitted, setSubmitted] = useState(null)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onViewSubmissions={() => setView('submissions')} />

      {view === 'submissions' && (
        <SubmissionsPage onBack={() => setView('form')} />
      )}
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