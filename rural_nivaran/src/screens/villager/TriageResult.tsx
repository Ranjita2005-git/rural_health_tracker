import { useState, useEffect } from 'react'
import { useNav } from '../../context/NavContext'
import { useTranslation } from 'react-i18next'

type Level = 'home' | 'phc' | 'urgent'

interface ChatbotResponse {
  message_hi?: string
  message_en?: string
  disease?: string | null
  disease_name_hi?: string | null
  disease_name_en?: string | null
  triage?: Level | null
  triage_label_hi?: string | null
  triage_label_en?: string | null
  steps_hi?: string[]
  steps_en?: string[]
}

const RESULTS = {
  home: {
    emoji: '🏠',
    headerBg: 'bg-emerald-600',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    stepBg: 'bg-emerald-50',
    stepBorder: 'border-emerald-200',
    stepNumBg: 'bg-emerald-600',
    stepText: 'text-emerald-800',
  },
  phc: {
    emoji: '🏥',
    headerBg: 'bg-amber-500',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    stepBg: 'bg-amber-50',
    stepBorder: 'border-amber-200',
    stepNumBg: 'bg-amber-500',
    stepText: 'text-amber-800',
  },
  urgent: {
    emoji: '🚨',
    headerBg: 'bg-red-600',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-800',
    stepBg: 'bg-red-50',
    stepBorder: 'border-red-200',
    stepNumBg: 'bg-red-600',
    stepText: 'text-red-800',
  },
}

export default function TriageResult() {
  const { navigate, goBack } = useNav()
  const { t, i18n } = useTranslation()

  const [chatbotResponse, setChatbotResponse] =
    useState<ChatbotResponse | null>(null)

  useEffect(() => {
    const savedResponse = localStorage.getItem('chatbotResponse')

    if (savedResponse) {
      try {
        setChatbotResponse(JSON.parse(savedResponse))
      } catch (error) {
        console.error('Invalid chatbot response:', error)
      }
    }
  }, [])

  const level: Level = chatbotResponse?.triage ?? 'home'
  const r = RESULTS[level]

  const resultContent = {
    home: {
      levelHi: t('triage.homeLevel'),
      levelEn: t('triage.homeLevelEn'),
      badgeLabel: t('triage.homeBadge'),
      titleHi: t('triage.homeTitle'),
      steps: [
        {
          hi: t('triage.homeStep1'),
          en: t('triage.homeStep1En'),
        },
        {
          hi: t('triage.homeStep2'),
          en: t('triage.homeStep2En'),
        },
        {
          hi: t('triage.homeStep3'),
          en: t('triage.homeStep3En'),
        },
        {
          hi: t('triage.homeStep4'),
          en: t('triage.homeStep4En'),
        },
      ],
    },

    phc: {
      levelHi: t('triage.phcLevel'),
      levelEn: t('triage.phcLevelEn'),
      badgeLabel: t('triage.phcBadge'),
      titleHi: t('triage.phcTitle'),
      steps: [
        {
          hi: t('triage.phcStep1'),
          en: t('triage.phcStep1En'),
        },
        {
          hi: t('triage.phcStep2'),
          en: t('triage.phcStep2En'),
        },
        {
          hi: t('triage.phcStep3'),
          en: t('triage.phcStep3En'),
        },
        {
          hi: t('triage.phcStep4'),
          en: t('triage.phcStep4En'),
        },
      ],
    },

    urgent: {
      levelHi: t('triage.urgentLevel'),
      levelEn: t('triage.urgentLevelEn'),
      badgeLabel: t('triage.urgentBadge'),
      titleHi: t('triage.urgentTitle'),
      steps: [
        {
          hi: t('triage.urgentStep1'),
          en: t('triage.urgentStep1En'),
        },
        {
          hi: t('triage.urgentStep2'),
          en: t('triage.urgentStep2En'),
        },
        {
          hi: t('triage.urgentStep3'),
          en: t('triage.urgentStep3En'),
        },
        {
          hi: t('triage.urgentStep4'),
          en: t('triage.urgentStep4En'),
        },
      ],
    },
  }

  const content = resultContent[level]

  // Detect current language
  const lang = i18n.language.startsWith('hi') ? 'hi' : 'en'

  // Use chatbot-generated steps
  const chatbotSteps =
    lang === 'hi'
      ? chatbotResponse?.steps_hi ?? []
      : chatbotResponse?.steps_en ?? []

  // Use chatbot-generated disease name
  const diseaseName =
    lang === 'hi'
      ? chatbotResponse?.disease_name_hi
      : chatbotResponse?.disease_name_en

  // Use chatbot steps when available, otherwise keep old fallback steps
  const displaySteps =
    chatbotSteps.length > 0
      ? chatbotSteps
      : lang === 'hi'
        ? content.steps.map((step) => step.hi)
        : content.steps.map((step) => step.en)

  return (
    <div className="min-h-full bg-cream overflow-y-auto">
      {/* Header */}
      <div className={`${r.headerBg} px-5 pt-6 pb-7 text-white`}>
        <button
          onClick={goBack}
          className="text-white/60 mb-4 flex items-center gap-1"
        >
          <svg
            className="w-5 h-5"
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

          <span className="text-sm">{t('common.back')}</span>
        </button>

        <div className="flex items-center gap-4 mb-3">
          <span className="text-5xl">{r.emoji}</span>

          <div>
            <p className="devanagari text-2xl font-bold leading-tight">
              {content.levelHi}
            </p>

            <p className="text-white/70 text-sm">
              {content.levelEn}
            </p>
          </div>
        </div>

        <div
          className={`inline-flex items-center px-3 py-1.5 rounded-full ${r.badgeBg}`}
        >
          <p
            className={`devanagari text-xs font-bold ${r.badgeText}`}
          >
            {content.badgeLabel}
          </p>
        </div>
      </div>

      {/* Detected symptoms */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-xl p-4 border border-cream-dark">
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wide mb-2">
            {t('triage.detectedSymptoms')}
          </p>

          <p className="devanagari text-zinc-700 text-sm leading-relaxed italic">
            "{localStorage.getItem('symptoms') || 'No symptoms detected'}"
          </p>
        </div>
      </div>

      {/* Disease */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-xl p-4 border border-cream-dark">
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wide mb-2">
            {lang === 'hi' ? 'संभावित बीमारी' : 'Possible Condition'}
          </p>

          <p className="text-zinc-800 text-lg font-bold">
            {diseaseName ||
              (lang === 'hi'
                ? 'कोई बीमारी निर्धारित नहीं'
                : 'No specific condition detected')}
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="px-5 mt-4">
        <p
          className={`devanagari font-bold text-base ${r.stepText} mb-3`}
        >
          {diseaseName || content.titleHi}
        </p>

        <div className="flex flex-col gap-2">
          {displaySteps.map((step, i) => (
            <div
              key={i}
              className={`${r.stepBg} border ${r.stepBorder} rounded-xl p-3 flex gap-3 items-start`}
            >
              <div
                className={`w-6 h-6 ${r.stepNumBg} text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5`}
              >
                {i + 1}
              </div>

              <div>
                <p
                  className={`${
                    lang === 'hi' ? 'devanagari' : ''
                  } ${r.stepText} text-sm font-semibold`}
                >
                  {step}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 mt-5 mb-8 flex flex-col gap-3">
        <button
          onClick={() => navigate('phc-locator')}
          className="w-full bg-forest text-white rounded-xl py-4 font-bold devanagari text-base flex items-center justify-center gap-2 hover:bg-forest-dark active:scale-[0.98] transition-all"
        >
          <span>🏥</span>
          {t('triage.nearestPHC')}
        </button>

        <p className="text-center text-zinc-400 text-xs">
          {t('triage.nearestPHCInfo')}
        </p>

        <button
          onClick={() => navigate('villager-home')}
          className="w-full bg-white text-zinc-500 border border-zinc-200 rounded-xl py-3 text-sm devanagari hover:bg-zinc-50 active:scale-[0.98] transition-all"
        >
          {t('triage.backHome')}
        </button>

        <p className="text-center text-zinc-400 text-[10px]">
          {t('triage.disclaimer')}
        </p>
      </div>
    </div>
  )
}