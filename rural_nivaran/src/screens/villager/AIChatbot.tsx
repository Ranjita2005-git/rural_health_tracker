import { useState, useRef, useEffect } from 'react'
import { useNav } from '../../context/NavContext'
import { useTranslation } from 'react-i18next'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  text: string
  disease?: string | null
  diseaseNameHi?: string | null
  diseaseNameEn?: string | null
  triage?: 'home' | 'phc' | 'urgent' | null
  triageLabelHi?: string | null
  triageLabelEn?: string | null
  stepsHi?: string[]
  stepsEn?: string[]
}

// ---------------------------------------------------------------------------
// Rule-based offline disease engine (mirrors backend/chatRouter.py)
// ---------------------------------------------------------------------------

const DISEASE_RULES = [
  {
    id: 'dengue',
    keywords: ['dengue', 'platelet', 'joint pain', 'bone pain',
      'high fever', 'tez bukhar', 'हड्डी दर्द', 'जोड़ दर्द',
      'जोड़ों में दर्द', 'चकत्ते', 'प्लेटलेट', 'डेंगू'],
    nameHi: 'डेंगू बुखार', nameEn: 'Dengue Fever',
    triage: 'urgent' as const,
    adviceHi: 'तुरंत PHC जाएं। डेंगू में प्लेटलेट कम होती है — यह गंभीर हो सकता है।',
    adviceEn: 'Visit PHC immediately. Dengue can lower platelets — this may be serious.',
    stepsHi: ['आज ही नजदीकी PHC या अस्पताल जाएं।', 'खूब पानी और ORS पिएं।', 'Aspirin या Ibuprofen न लें — केवल Paracetamol लें।', 'रात को मच्छरदानी का प्रयोग करें।'],
    stepsEn: ['Visit nearest PHC or hospital today.', 'Drink plenty of water and ORS.', 'Do NOT take aspirin or ibuprofen — only paracetamol.', 'Use mosquito net at night.'],
  },
  {
    id: 'malaria',
    keywords: ['malaria', 'chills', 'shivering', 'कंपकंपी', 'मलेरिया', 'ठंड लगना', 'बार बार बुखार', 'cyclic fever'],
    nameHi: 'मलेरिया', nameEn: 'Malaria',
    triage: 'urgent' as const,
    adviceHi: 'तुरंत PHC जाएं। मलेरिया की जांच (RDT) और दवा मुफ़्त मिलती है।',
    adviceEn: 'Visit PHC immediately. Malaria RDT test and medicine are free.',
    stepsHi: ['आज ही PHC में Malaria RDT टेस्ट करवाएं।', 'बुखार के लिए Paracetamol लें।', 'मच्छरदानी लगाएं और पूरी बाहें वाले कपड़े पहनें।', 'अकेले न जाएं — परिवार के सदस्य को साथ लाएं।'],
    stepsEn: ['Get Malaria RDT test at PHC today.', 'Take paracetamol for fever.', 'Use mosquito net and wear full-sleeve clothes.', 'Do not go alone — bring a family member.'],
  },
  {
    id: 'typhoid',
    keywords: ['typhoid', 'टाइफाइड', 'continuous fever', 'लगातार बुखार', 'stomach pain', 'pet dard', 'पेट दर्द', 'weakness', 'कमजोरी'],
    nameHi: 'टाइफाइड (मोतीझरा)', nameEn: 'Typhoid Fever',
    triage: 'phc' as const,
    adviceHi: 'PHC में डॉक्टर से मिलें। Widal टेस्ट और एंटीबायोटिक दवाएं ज़रूरी हैं।',
    adviceEn: 'See a doctor at PHC. Widal test and antibiotic treatment are needed.',
    stepsHi: ['24 घंटे में PHC जाएं।', 'बाहर का खाना और कच्चा पानी बिल्कुल न लें।', 'हल्का खाना खाएं — खिचड़ी, दलिया।', 'डॉक्टर का पूरा कोर्स पूरा करें।'],
    stepsEn: ['Visit PHC within 24 hours.', 'Avoid street food and untreated water.', 'Eat light food — khichdi, porridge.', 'Complete the full antibiotic course prescribed by doctor.'],
  },
  {
    id: 'diarrhoea',
    keywords: ['diarrhoea', 'diarrhea', 'loose motions', 'loose stool', 'दस्त', 'loose motion', 'watery stool', 'पानी जैसा', 'बार बार दस्त'],
    nameHi: 'दस्त / डायरिया', nameEn: 'Diarrhoea',
    triage: 'home' as const,
    adviceHi: 'ORS घोल पिएं। अगर 24 घंटे में ठीक न हो या रक्त दिखे तो PHC जाएं।',
    adviceEn: 'Drink ORS solution. Visit PHC if not better in 24 h or if blood appears.',
    stepsHi: ['हर दस्त के बाद 1 गिलास ORS पिएं।', 'घर का बना ORS: 1 लीटर पानी + 6 चम्मच चीनी + आधा चम्मच नमक।', 'बच्चों को Zinc की गोली दें।', 'खाना बनाने से पहले और शौच के बाद हाथ धोएं।'],
    stepsEn: ['Drink 1 glass of ORS after every loose stool.', 'Home ORS: 1 L water + 6 tsp sugar + ½ tsp salt.', 'Give Zinc tablet to children (per doctor advice).', 'Wash hands before cooking and after toilet.'],
  },
  {
    id: 'respiratory',
    keywords: ['cough', 'cold', 'breathless', 'breathing', 'shortness', 'खांसी', 'जुकाम', 'सांस', 'chest pain', 'सीने में दर्द', 'सांस फूलना', 'सांस लेने में तकलीफ', 'wheezing'],
    nameHi: 'श्वास / खांसी की समस्या', nameEn: 'Respiratory Issue',
    triage: 'phc' as const,
    adviceHi: 'अगर सांस लेने में ज़्यादा तकलीफ है तो तुरंत PHC जाएं।',
    adviceEn: 'If breathing difficulty is severe, go to PHC immediately.',
    stepsHi: ['गर्म पानी से भाप लें।', 'ठंडा पानी और धूल से बचें।', 'PHC में डॉक्टर को दिखाएं।', 'बच्चों में fast breathing होने पर तुरंत PHC जाएं।'],
    stepsEn: ['Inhale steam with warm water.', 'Avoid cold water, dust, and smoke.', 'Consult doctor at PHC.', 'If child has fast breathing, go to PHC immediately.'],
  },
  {
    id: 'fever_headache',
    keywords: ['fever', 'bukhar', 'बुखार', 'headache', 'sir dard', 'सिर दर्द', 'सिरदर्द', 'body ache', 'बदन दर्द', 'temperature', 'गर्मी', 'nausea', 'ulti', 'उल्टी'],
    nameHi: 'बुखार / सिरदर्द', nameEn: 'Fever / Headache',
    triage: 'home' as const,
    adviceHi: 'घर पर आराम करें। Paracetamol 500 mg लें। 3 दिन में ठीक न हो तो PHC जाएं।',
    adviceEn: 'Rest at home. Take paracetamol 500 mg. If not better in 3 days, visit PHC.',
    stepsHi: ['Paracetamol 500 mg हर 6 घंटे में लें।', 'खूब पानी पिएं — दिन में कम से कम 8-10 गिलास।', '2-3 दिन आराम करें, बाहर जाने से बचें।', '3 दिन में सुधार न हो या बुखार 103°F से ज़्यादा हो तो PHC जाएं।'],
    stepsEn: ['Take paracetamol 500 mg every 6 hours.', 'Drink plenty of water — at least 8-10 glasses a day.', 'Rest for 2-3 days, avoid going out.', 'Visit PHC if no improvement in 3 days or fever above 103°F.'],
  },
  {
    id: 'skin',
    keywords: ['rash', 'itching', 'खुजली', 'चकत्ते', 'skin', 'लाल दाने', 'red spots', 'wound', 'घाव', 'जलन', 'burning skin', 'pus', 'मवाद', 'scabies', 'खाज'],
    nameHi: 'त्वचा की समस्या', nameEn: 'Skin Problem',
    triage: 'phc' as const,
    adviceHi: 'खुजली वाली जगह को नखों से न खुजाएं। PHC में डॉक्टर को दिखाएं।',
    adviceEn: 'Do not scratch the affected area. Show to a doctor at PHC.',
    stepsHi: ['प्रभावित जगह को साफ और सूखा रखें।', 'साबुन और पानी से धीरे से धोएं।', 'PHC जाएं — डॉक्टर से क्रीम या दवा लें।', 'तौलिया और कपड़े परिवार के अन्य सदस्यों के साथ share न करें।'],
    stepsEn: ['Keep affected area clean and dry.', 'Gently wash with soap and water.', 'Visit PHC and get cream or medicine from doctor.', 'Do not share towels or clothes with family members.'],
  },
  {
    id: 'eye',
    keywords: ['eye', 'आंख', 'आँख', 'red eye', 'लाल आँख', 'discharge', 'conjunctivitis', 'आँख आना', 'आँख से पानी', 'blurred vision', 'धुंधला दिखना'],
    nameHi: 'आंख की समस्या', nameEn: 'Eye Problem',
    triage: 'phc' as const,
    adviceHi: 'आंखें मलें नहीं। PHC में डॉक्टर को दिखाएं।',
    adviceEn: 'Do not rub your eyes. See a doctor at PHC.',
    stepsHi: ['आंखें मलने से बचें।', 'साफ पानी से आंखें धोएं।', 'PHC में Eye specialist या डॉक्टर से मिलें।', 'अपना तौलिया अलग रखें — संक्रमण फैल सकता है।'],
    stepsEn: ['Avoid rubbing your eyes.', 'Rinse eyes with clean water.', 'Meet eye specialist or doctor at PHC.', 'Keep your towel separate — infection can spread.'],
  },
]

const GREETING_RE = /\b(hello|hi|namaskar|namaste|नमस्ते|हेलो|नमस्कार|jai|जय|help|मदद)\b/i

function matchDisease(text: string) {
  const lower = text.toLowerCase()
  for (const rule of DISEASE_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw.toLowerCase())) return rule
    }
  }
  return null
}

function buildBotMessage(userText: string, lang: string): ChatMessage {
  const id = Date.now() + 1

  if (GREETING_RE.test(userText) && userText.length < 60) {
    return {
      id,
      role: 'assistant',
      text: lang === 'hi'
        ? 'नमस्ते! 🙏 मैं आपका स्वास्थ्य सहायक हूँ।\n\nअपने लक्षण बताएं जैसे:\n• मुझे बुखार और सिर दर्द है\n• I have loose motions\n• बच्चे को खांसी है\n\nमैं सही सलाह दूंगा। 💊'
        : 'Namaste! 🙏 I am your health assistant.\n\nDescribe your symptoms, e.g.:\n• I have fever and headache\n• मुझे दस्त हो रहे हैं\n\nI will guide you with the right advice. 💊',
    }
  }

  const rule = matchDisease(userText)

  if (!rule) {
    return {
      id,
      role: 'assistant',
      text: lang === 'hi'
        ? 'मुझे आपके लक्षण समझ नहीं आए। 😕\n\nकृपया स्पष्ट रूप से बताएं — जैसे बुखार, खांसी, दस्त, उल्टी, दाने।\n\nया सीधे नजदीकी PHC जाएं।'
        : 'I could not understand your symptoms. 😕\n\nPlease describe clearly — e.g. fever, cough, loose motions, vomiting, rash.\n\nOr visit your nearest PHC directly.',
    }
  }

  return {
    id,
    role: 'assistant',
    text: lang === 'hi'
      ? `**${rule.nameHi}** के लक्षण मिले। 🔍\n\n${rule.adviceHi}`
      : `Symptoms match **${rule.nameEn}**. 🔍\n\n${rule.adviceEn}`,
    disease: rule.id,
    diseaseNameHi: rule.nameHi,
    diseaseNameEn: rule.nameEn,
    triage: rule.triage,
    stepsHi: rule.stepsHi,
    stepsEn: rule.stepsEn,
  }
}

// ---------------------------------------------------------------------------
// Triage config
// ---------------------------------------------------------------------------

const TRIAGE_CONFIG = {
  home: {
    bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800', label: '🏠', stepBg: 'bg-emerald-50',
    stepBorder: 'border-emerald-200', stepNum: 'bg-emerald-600',
  },
  phc: {
    bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800', label: '🏥', stepBg: 'bg-amber-50',
    stepBorder: 'border-amber-200', stepNum: 'bg-amber-500',
  },
  urgent: {
    bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700',
    badge: 'bg-red-100 text-red-800', label: '🚨', stepBg: 'bg-red-50',
    stepBorder: 'border-red-200', stepNum: 'bg-red-600',
  },
}

const TRIAGE_LABEL: Record<string, { hi: string; en: string }> = {
  home: { hi: '🏠 घर पर आराम करें', en: '🏠 Rest at Home' },
  phc: { hi: '🏥 PHC जाएं (24 घंटे में)', en: '🏥 Visit PHC (within 24 h)' },
  urgent: { hi: '🚨 तुरंत अस्पताल जाएं', en: '🚨 Go to Hospital Immediately' },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AIChatbot() {
  const { goBack, navigate } = useNav()
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith('hi') ? 'hi' : 'en'

  const WELCOME: ChatMessage = {
    id: 0,
    role: 'assistant',
    text: lang === 'hi'
      ? 'नमस्ते! 🙏 मैं आपका स्वास्थ्य सहायक हूँ।\n\nअपने लक्षण बताएं जैसे:\n• मुझे बुखार और सिर दर्द है\n• बच्चे को दस्त हो रहे हैं\n• I have cough and cold\n\nमैं सही सलाह दूंगा। 💊'
      : 'Namaste! 🙏 I am your health assistant.\n\nDescribe your symptoms, e.g.:\n• I have fever and headache\n• My child has loose motions\n• मुझे खांसी है\n\nI will guide you with the right advice. 💊',
  }

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = () => {
    const text = input.trim()
    if (!text) return

    const userMsg: ChatMessage = { id: Date.now(), role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate brief "thinking" delay
    setTimeout(() => {
      const botMsg = buildBotMessage(text, lang)
      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
    }, 700)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-full bg-forest flex flex-col">

      {/* ── Header ── */}
      <div className="flex items-center px-5 pt-10 pb-4 flex-shrink-0">
        <button onClick={goBack} className="text-green-300 mr-3 p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
              <span className="text-forest font-bold text-sm">AI</span>
            </div>
            <div>
              <h2 className="devanagari text-white font-bold text-base leading-tight">
                {t('chatbot.title')}
              </h2>
              <p className="text-green-400 text-[10px]">{t('chatbot.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-800/60 border border-green-700 rounded-full px-2.5 py-1">
          <p className="text-green-300 text-[10px] font-bold">● {t('chatbot.online')}</p>
        </div>
      </div>

      {/* ── Chat messages ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3">

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1 self-start">
                <span className="text-forest font-bold text-[10px]">AI</span>
              </div>
            )}

            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>

              {/* Bubble */}
              <div className={`rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-white text-zinc-800 rounded-tr-sm'
                  : 'bg-white/10 border border-white/15 text-white rounded-tl-sm'
              }`}>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'assistant' ? 'devanagari' : ''}`}>
                  {msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                </p>
              </div>

              {/* Triage badge + steps card (assistant only) */}
              {msg.role === 'assistant' && msg.triage && (() => {
                const cfg = TRIAGE_CONFIG[msg.triage as keyof typeof TRIAGE_CONFIG]
                const label = TRIAGE_LABEL[msg.triage]
                const steps = lang === 'hi' ? (msg.stepsHi ?? []) : (msg.stepsEn ?? [])
                const diseaseName = lang === 'hi' ? msg.diseaseNameHi : msg.diseaseNameEn

                return (
                  <div className={`w-full rounded-2xl border ${cfg.border} ${cfg.bg} p-3`}>

                    {/* Disease name + triage badge */}
                    <div className="flex items-center gap-2 mb-2">
                      {diseaseName && (
                        <span className={`devanagari text-xs font-bold ${cfg.text}`}>{diseaseName}</span>
                      )}
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {label ? (lang === 'hi' ? label.hi : label.en) : ''}
                      </span>
                    </div>

                    {/* Steps */}
                    <div className="flex flex-col gap-1.5">
                      {steps.map((step, i) => (
                        <div key={i} className={`flex gap-2 items-start ${cfg.stepBg} border ${cfg.stepBorder} rounded-xl p-2`}>
                          <div className={`w-5 h-5 ${cfg.stepNum} text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0`}>
                            {i + 1}
                          </div>
                          <p className={`devanagari text-xs ${cfg.text} leading-snug`}>{step}</p>
                        </div>
                      ))}
                    </div>

                    {/* PHC CTA for urgent/phc triage */}
                    {(msg.triage === 'urgent' || msg.triage === 'phc') && (
                      <button
                        onClick={() => navigate('phc-locator')}
                        className={`mt-2.5 w-full py-2 rounded-xl text-xs font-bold ${cfg.badge} border ${cfg.border}`}
                      >
                        🏥 {lang === 'hi' ? 'नजदीकी PHC देखें →' : 'View Nearest PHC →'}
                      </button>
                    )}

                  </div>
                )
              })()}

            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start items-end gap-2">
            <div className="w-7 h-7 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-forest font-bold text-[10px]">AI</span>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-green-300 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Quick symptom chips ── */}
      <div className="px-4 pb-2 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { hi: 'बुखार', en: 'Fever' },
            { hi: 'खांसी', en: 'Cough' },
            { hi: 'दस्त', en: 'Loose motions' },
            { hi: 'उल्टी', en: 'Vomiting' },
            { hi: 'सिर दर्द', en: 'Headache' },
            { hi: 'खुजली', en: 'Itching' },
          ].map(chip => (
            <button
              key={chip.en}
              onClick={() => {
                setInput(prev => prev ? `${prev}, ${lang === 'hi' ? chip.hi : chip.en}` : (lang === 'hi' ? chip.hi : chip.en))
              }}
              className="flex-shrink-0 devanagari bg-white/10 border border-white/20 text-green-200 text-xs px-3 py-1.5 rounded-full hover:bg-white/20 active:scale-95 transition-all"
            >
              {lang === 'hi' ? chip.hi : chip.en}
            </button>
          ))}
        </div>
      </div>

      {/* ── Input bar ── */}
      <div className="px-4 pb-6 pt-2 flex-shrink-0">
        <div className="flex gap-2 items-end bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder={lang === 'hi' ? 'लक्षण लिखें... (जैसे: बुखार, खांसी)' : 'Describe symptoms... (e.g. fever, cough)'}
            className="flex-1 bg-transparent text-white placeholder-green-500 devanagari text-sm resize-none outline-none leading-snug max-h-24"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-10 h-10 bg-green-400 disabled:bg-green-800 rounded-xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5 text-forest" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <p className="text-green-600 text-[10px] text-center mt-1.5">
          {t('chatbot.disclaimer')}
        </p>
      </div>

    </div>
  )
}
