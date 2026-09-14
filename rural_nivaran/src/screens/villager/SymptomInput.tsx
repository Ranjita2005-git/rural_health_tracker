import { useState, useRef } from 'react'
import { useNav } from '../../context/NavContext'
import { useTranslation } from 'react-i18next'

type Phase = 'idle' | 'recording' | 'analyzing'

export default function SymptomInput() {
  const { navigate, goBack } = useNav()
  const { t,i18n } = useTranslation()

  const [phase, setPhase] = useState<Phase>('idle')
  const [transcript, setTranscript] = useState('')

  const recognitionRef = useRef<any>(null)
  const transcriptRef = useRef('')


  const handleMicPress = async() => {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition

  if (!SpeechRecognition) {
    alert('Speech recognition is not supported in this browser.')
    return
  }

  if (phase === 'idle') {
    const recognition = new SpeechRecognition()

    const selectedLanguage = i18n.language.startsWith('bn')
      ? 'bn-IN'
      : i18n.language.startsWith('en')
      ? 'en-IN'
      : 'hi-IN'

  recognition.lang = selectedLanguage
    recognition.continuous = true
    recognition.interimResults = true

    recognitionRef.current = recognition
    transcriptRef.current = ''
    setTranscript('')
    setPhase('recording')

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          finalTranscript += text
        } else {
          interimTranscript += text
        }
      }

      if (finalTranscript) {
        transcriptRef.current += finalTranscript + ' '
      }

      setTranscript(
        transcriptRef.current + interimTranscript
      )
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setPhase('idle')
    }

    recognition.onend = () => {
      setTranscript(transcriptRef.current.trim())
    }

    recognition.start()

  } else if (phase === 'recording') {
  recognitionRef.current?.stop()

  const finalText = transcriptRef.current.trim()

  if (!finalText) {
    setPhase('idle')
    return
  }

  localStorage.setItem('symptoms', finalText)

  setPhase('analyzing')

  try {
    const response = await fetch('http://127.0.0.1:8000/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: finalText,
        lang: 'hi',
      }),
    })

    if (!response.ok) {
      throw new Error(`Chat API error: ${response.status}`)
    }

    const data = await response.json()

    localStorage.setItem('chatbotResponse', JSON.stringify(data))

    navigate('triage-result')
  } catch (error) {
    console.error('Chatbot connection error:', error)
    navigate('triage-result')
  }
  }
}

  return (
    <div className="h-full bg-forest flex flex-col pt-8">

      {/* Header */}
      <div className="flex items-center px-5 pt-2 pb-4">

        <button
          onClick={goBack}
          className="text-green-300 mr-3 p-1"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div>
          <h2 className="devanagari text-white font-bold text-xl leading-tight">
            {phase === 'analyzing'
              ? t('symptoms.analyzing')
              : t('symptoms.title')}
          </h2>

          <p className="text-green-400 text-xs">
            {phase === 'analyzing'
              ? t('symptoms.analyzingEnglish')
              : t('symptoms.speakSymptoms')}
          </p>
        </div>
      </div>


      {/* Main area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">

        {phase === 'analyzing' ? (

          <div className="flex flex-col items-center gap-6">

            <div className="w-24 h-24 border-4 border-green-600 border-t-white rounded-full animate-spin" />

            <div className="text-center">

              <p className="devanagari text-white text-2xl font-bold mb-1">
                {t('symptoms.checking')}
              </p>

              <p className="text-green-300 text-sm">
                {t('symptoms.ruleBasedTriage')}
              </p>

            </div>

            <div className="flex gap-1.5 mt-2">

              {[
                t('symptoms.fever'),
                t('symptoms.headache'),
                t('symptoms.nausea')
              ].map((symptom) => (
                <span
                  key={symptom}
                  className="devanagari bg-white/10 text-green-200 text-xs px-2 py-1 rounded-lg border border-white/15"
                >
                  {symptom}
                </span>
              ))}

            </div>

          </div>

        ) : (

          <>

            {/* Mic button with ripple */}
            <div className="relative flex items-center justify-center mb-10">

              {phase === 'recording' && (
                <>
                  <div className="absolute w-44 h-44 bg-white/8 rounded-full animate-ping" />

                  <div
                    className="absolute w-36 h-36 bg-white/12 rounded-full animate-ping"
                    style={{ animationDelay: '300ms' }}
                  />
                </>
              )}

              <button
                onClick={handleMicPress}
                className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-200 shadow-2xl active:scale-95 ${
                  phase === 'recording'
                    ? 'bg-red-500 scale-110'
                    : 'bg-white'
                }`}
              >

                {phase === 'recording' ? (

                  <div className="w-11 h-11 bg-white rounded-lg" />

                ) : (

                  <svg
                    className="w-16 h-16 text-forest"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>

                )}

              </button>

            </div>


            <p className="devanagari text-white text-2xl font-bold text-center mb-2">
              {phase === 'idle'
                ? t('symptoms.tapAndSpeak')
                : t('symptoms.listening')}
            </p>

            <p className="text-green-300 text-sm text-center">
              {phase === 'idle'
                ? t('symptoms.tapMic')
                : t('symptoms.tapAgain')}
            </p>

          </>

        )}

      </div>


      {/* Transcript bubble */}
      {(phase === 'recording' || phase === 'analyzing') && (

        <div className="mx-5 mb-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/15">

          <p className="text-green-300 text-[10px] font-bold uppercase tracking-wider mb-2">
            📝 {t('symptoms.transcribing')}
          </p>

          <p className="devanagari text-white text-base leading-relaxed min-h-12">

            {transcript}

            {phase === 'recording' && (
              <span className="inline-block w-0.5 h-4 bg-green-300 ml-0.5 animate-pulse align-middle" />
            )}

          </p>

        </div>

      )}
      


      {/* Language selector & photo option */}
      {phase === 'idle' && (
        <>
          <div className="mx-5 mb-8">

            <button className="w-full border-2 border-dashed border-green-700 rounded-xl p-3 flex items-center gap-3 hover:border-green-500 active:scale-[0.98] transition-all">

              <span className="text-2xl">📸</span>

              <div className="text-left">

                <p className="devanagari text-green-100 text-sm font-semibold">
                  {t('symptoms.addPhoto')}
                </p>

                <p className="text-green-500 text-xs">
                  {t('symptoms.addPhotoDescription')}
                </p>

              </div>

            </button>

          </div>

        </>

      )}

    </div>
  )
}
