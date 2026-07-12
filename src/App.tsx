import { useState } from 'react'
import ChiaaScrapbook from './components/ChiaaScrapbook'
import './App.css'

// Mock donation data for testing
const mockDonations = [
  {
    id: 1,
    name: 'Sakura',
    amount: 500,
    currency: 'INR',
    message: 'Keep streaming! Love your content ♡',
    media_url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600',
    media_type: 'image',
    voice_message_url: null,
    hypersound_url: null,
    is_hyperemote: false,
  },
  {
    id: 2,
    name: 'CherryBlossom',
    amount: 1000,
    currency: 'INR',
    message: 'You are amazing!',
    media_url: null,
    media_type: null,
    voice_message_url: null,
    hypersound_url: null,
    is_hyperemote: false,
  },
  {
    id: 3,
    name: 'Petal',
    amount: 250,
    currency: 'INR',
    message: 'Voice message test!',
    media_url: null,
    media_type: null,
    voice_message_url: 'https://example.com/voice.mp3',
    hypersound_url: null,
    is_hyperemote: false,
  },
  {
    id: 4,
    name: 'Memory',
    amount: 750,
    currency: 'INR',
    message: 'Hypersound alert!',
    media_url: null,
    media_type: null,
    voice_message_url: null,
    hypersound_url: 'https://example.com/sound.mp3',
    is_hyperemote: true,
  },
]

function App() {
  const [showAlert, setShowAlert] = useState(true)
  const [currentDonation, setCurrentDonation] = useState(mockDonations[0])

  const handleNextDonation = () => {
    setShowAlert(false)
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * mockDonations.length)
      setCurrentDonation(mockDonations[randomIndex])
      setShowAlert(true)
    }, 500)
  }

  return (
    <div className="app">
      <div className="controls">
        <h1>Chiaa Scrapbook Alert Demo</h1>
        <p style={{ marginBottom: '16px', color: '#666', fontSize: '14px' }}>
          The alert below has a transparent background for streaming overlays
        </p>
        <button onClick={handleNextDonation}>Test Next Donation</button>
        <button onClick={() => setShowAlert(!showAlert)}>
          {showAlert ? 'Hide' : 'Show'} Alert
        </button>
      </div>

      <div className="alert-container">
        {showAlert && (
          <ChiaaScrapbook
            donation={currentDonation}
            brandColor="#E8B4BC"
          />
        )}
      </div>
    </div>
  )
}

export default App
