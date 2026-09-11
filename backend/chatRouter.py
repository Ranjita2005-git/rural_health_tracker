"""
AI Disease-Recognition Chatbot router.

Rule-based symptom → triage engine.  Works fully offline — no external LLM
API key required.  Extend `DISEASE_RULES` to add more conditions.
"""

from fastapi import APIRouter
from pydantic import BaseModel
import re

router = APIRouter(prefix="/chat", tags=["AI Chatbot"])

# ---------------------------------------------------------------------------
# Symptom keyword → disease rule table
# ---------------------------------------------------------------------------

DISEASE_RULES: list[dict] = [
    {
        "id": "dengue",
        "keywords": ["dengue", "platelet", "joint pain", "bone pain",
                     "high fever", "tez bukhar", "हड्डी दर्द", "जोड़ दर्द",
                     "जोड़ों में दर्द", "चकत्ते", "प्लेटलेट", "डेंगू"],
        "name_hi": "डेंगू बुखार",
        "name_en": "Dengue Fever",
        "triage": "urgent",
        "advice_hi": "तुरंत PHC जाएं। डेंगू में प्लेटलेट कम होती है — यह गंभीर हो सकता है।",
        "advice_en": "Visit PHC immediately. Dengue can lower platelets — this may be serious.",
        "steps_hi": [
            "आज ही नजदीकी PHC या अस्पताल जाएं।",
            "खूब पानी और ORS पिएं।",
            "Aspirin या Ibuprofen न लें — केवल Paracetamol लें।",
            "रात को मच्छरदानी का प्रयोग करें।"
        ],
        "steps_en": [
            "Visit nearest PHC or hospital today.",
            "Drink plenty of water and ORS.",
            "Do NOT take aspirin or ibuprofen — only paracetamol.",
            "Use mosquito net at night."
        ]
    },
    {
        "id": "malaria",
        "keywords": ["malaria", "chills", "shivering", "कंपकंपी", "मलेरिया",
                     "ठंड लगना", "बार बार बुखार", "cyclic fever"],
        "name_hi": "मलेरिया",
        "name_en": "Malaria",
        "triage": "urgent",
        "advice_hi": "तुरंत PHC जाएं। मलेरिया की जांच (RDT) और दवा मुफ़्त मिलती है।",
        "advice_en": "Visit PHC immediately. Malaria RDT test and medicine are free.",
        "steps_hi": [
            "आज ही PHC में Malaria RDT टेस्ट करवाएं।",
            "बुखार के लिए Paracetamol लें।",
            "मच्छरदानी लगाएं और पूरी बाहें वाले कपड़े पहनें।",
            "अकेले न जाएं — किसी परिवार के सदस्य को साथ लाएं।"
        ],
        "steps_en": [
            "Get Malaria RDT test at PHC today.",
            "Take paracetamol for fever.",
            "Use mosquito net and wear full-sleeve clothes.",
            "Do not go alone — bring a family member."
        ]
    },
    {
        "id": "typhoid",
        "keywords": ["typhoid", "टाइफाइड", "continuous fever", "लगातार बुखार",
                     "stomach pain", "pet dard", "पेट दर्द", "weakness", "कमजोरी",
                     "7 days fever", "week fever"],
        "name_hi": "टाइफाइड (मोतीझरा)",
        "name_en": "Typhoid Fever",
        "triage": "phc",
        "advice_hi": "PHC में डॉक्टर से मिलें। Widal टेस्ट और एंटीबायोटिक दवाएं ज़रूरी हैं।",
        "advice_en": "See a doctor at PHC. Widal test and antibiotic treatment are needed.",
        "steps_hi": [
            "24 घंटे में PHC जाएं।",
            "बाहर का खाना और कच्चा पानी बिल्कुल न लें।",
            "हल्का खाना खाएं — खिचड़ी, दलिया।",
            "डॉक्टर का पूरा कोर्स पूरा करें।"
        ],
        "steps_en": [
            "Visit PHC within 24 hours.",
            "Avoid street food and untreated water.",
            "Eat light food — khichdi, porridge.",
            "Complete the full antibiotic course prescribed by doctor."
        ]
    },
    {
        "id": "diarrhoea",
        "keywords": ["diarrhoea", "diarrhea", "loose motions", "loose stool",
                     "दस्त", "loose motion", "panting", "watery stool",
                     "पानी जैसा", "बार बार दस्त"],
        "name_hi": "दस्त / डायरिया",
        "name_en": "Diarrhoea",
        "triage": "home",
        "advice_hi": "ORS घोल पिएं। अगर 24 घंटे में ठीक न हो या रक्त दिखे तो PHC जाएं।",
        "advice_en": "Drink ORS solution. Visit PHC if not better in 24 h or if blood appears.",
        "steps_hi": [
            "हर दस्त के बाद 1 गिलास ORS पिएं।",
            "घर का बना ORS: 1 लीटर पानी + 6 चम्मच चीनी + आधा चम्मच नमक।",
            "बच्चों को Zinc की गोली दें (डॉक्टर की सलाह से)।",
            "खाना बनाने से पहले और शौच के बाद हाथ धोएं।"
        ],
        "steps_en": [
            "Drink 1 glass of ORS after every loose stool.",
            "Home ORS: 1 L water + 6 tsp sugar + ½ tsp salt.",
            "Give Zinc tablet to children (per doctor advice).",
            "Wash hands before cooking and after toilet."
        ]
    },
    {
        "id": "respiratory",
        "keywords": ["cough", "cold", "breathless", "breathing", "shortness",
                     "खांसी", "जुकाम", "सांस", "chest pain", "सीने में दर्द",
                     "सांस फूलना", "सांस लेने में तकलीफ", "wheezing"],
        "name_hi": "श्वास / खांसी की समस्या",
        "name_en": "Respiratory Issue",
        "triage": "phc",
        "advice_hi": "अगर सांस लेने में ज़्यादा तकलीफ है तो तुरंत PHC जाएं।",
        "advice_en": "If breathing difficulty is severe, go to PHC immediately.",
        "steps_hi": [
            "गर्म पानी से भाप लें।",
            "ठंडा पानी और धूल से बचें।",
            "PHC में डॉक्टर को दिखाएं।",
            "बच्चों में fast breathing होने पर तुरंत PHC जाएं।"
        ],
        "steps_en": [
            "Inhale steam with warm water.",
            "Avoid cold water, dust, and smoke.",
            "Consult doctor at PHC.",
            "If child has fast breathing, go to PHC immediately."
        ]
    },
    {
        "id": "fever_headache",
        "keywords": ["fever", "bukhar", "बुखार", "headache", "sir dard",
                     "सिर दर्द", "सिरदर्द", "body ache", "बदन दर्द",
                     "temperature", "गर्मी", "nausea", "ulti", "उल्टी"],
        "name_hi": "बुखार / सिरदर्द",
        "name_en": "Fever / Headache",
        "triage": "home",
        "advice_hi": "घर पर आराम करें। Paracetamol 500 mg लें। 3 दिन में ठीक न हो तो PHC जाएं।",
        "advice_en": "Rest at home. Take paracetamol 500 mg. If not better in 3 days, visit PHC.",
        "steps_hi": [
            "Paracetamol 500 mg हर 6 घंटे में लें (बुखार होने पर)।",
            "खूब पानी पिएं — दिन में कम से कम 8-10 गिलास।",
            "2-3 दिन आराम करें, बाहर जाने से बचें।",
            "3 दिन में सुधार न हो या बुखार 103°F से ज़्यादा हो तो PHC जाएं।"
        ],
        "steps_en": [
            "Take paracetamol 500 mg every 6 hours (when feverish).",
            "Drink plenty of water — at least 8-10 glasses a day.",
            "Rest for 2-3 days, avoid going out.",
            "Visit PHC if no improvement in 3 days or fever above 103°F."
        ]
    },
    {
        "id": "skin",
        "keywords": ["rash", "itching", "खुजली", "चकत्ते", "skin", "लाल दाने",
                     "red spots", "wound", "घाव", "जलन", "burning skin",
                     "pus", "मवाद", "scabies", "खाज"],
        "name_hi": "त्वचा की समस्या",
        "name_en": "Skin Problem",
        "triage": "phc",
        "advice_hi": "खुजली वाली जगह को नखों से न खुजाएं। PHC में डॉक्टर को दिखाएं।",
        "advice_en": "Do not scratch the affected area. Show to a doctor at PHC.",
        "steps_hi": [
            "प्रभावित जगह को साफ और सूखा रखें।",
            "साबुन और पानी से धीरे से धोएं।",
            "PHC जाएं — डॉक्टर से क्रीम या दवा लें।",
            "तौलिया और कपड़े परिवार के अन्य सदस्यों के साथ share न करें।"
        ],
        "steps_en": [
            "Keep affected area clean and dry.",
            "Gently wash with soap and water.",
            "Visit PHC and get cream or medicine from doctor.",
            "Do not share towels or clothes with family members."
        ]
    },
    {
        "id": "eye",
        "keywords": ["eye", "आंख", "आँख", "red eye", "लाल आँख", "discharge",
                     "conjunctivitis", "आँख आना", "आँख से पानी", "blurred vision",
                     "धुंधला दिखना"],
        "name_hi": "आंख की समस्या",
        "name_en": "Eye Problem",
        "triage": "phc",
        "advice_hi": "आंखें मलें नहीं। PHC में डॉक्टर को दिखाएं।",
        "advice_en": "Do not rub your eyes. See a doctor at PHC.",
        "steps_hi": [
            "आंखें मलने से बचें।",
            "साफ पानी से आंखें धोएं।",
            "PHC में Eye specialist या डॉक्टर से मिलें।",
            "अपना तौलिया अलग रखें — संक्रमण फैल सकता है।"
        ],
        "steps_en": [
            "Avoid rubbing your eyes.",
            "Rinse eyes with clean water.",
            "Meet eye specialist or doctor at PHC.",
            "Keep your towel separate — infection can spread."
        ]
    },
]

GREETING_PATTERNS = re.compile(
    r"\b(hello|hi|namaskar|namaste|नमस्ते|हेलो|नमस्कार|jai|जय|help|मदद)\b",
    re.IGNORECASE,
)

GREETING_RESPONSE = {
    "role": "assistant",
    "message_hi": (
        "नमस्ते! 🙏 मैं आपका स्वास्थ्य सहायक हूँ।\n\n"
        "अपने लक्षण हिंदी या English में बताएं — जैसे:\n"
        "• \"मुझे बुखार और सिर दर्द है\"\n"
        "• \"I have fever and body ache\"\n"
        "• \"बच्चे को दस्त हो रहे हैं\"\n\n"
        "मैं आपको सही सलाह दूंगा। 💊"
    ),
    "message_en": (
        "Namaste! 🙏 I am your health assistant.\n\n"
        "Describe your symptoms in Hindi or English — for example:\n"
        "• \"मुझे बुखार और सिर दर्द है\" (I have fever and headache)\n"
        "• \"I have loose motions since morning\"\n\n"
        "I will guide you with the right advice. 💊"
    ),
    "disease": None,
    "triage": None,
    "steps_hi": [],
    "steps_en": [],
}

FALLBACK_RESPONSE = {
    "role": "assistant",
    "message_hi": (
        "मुझे आपके लक्षण समझ नहीं आए। 😕\n\n"
        "कृपया अधिक स्पष्ट रूप से बताएं — जैसे:\n"
        "• बुखार, सिर दर्द, खांसी, दस्त, उल्टी, दाने\n\n"
        "या सीधे नजदीकी PHC जाएं।"
    ),
    "message_en": (
        "I could not understand your symptoms. 😕\n\n"
        "Please describe more clearly — for example:\n"
        "• fever, headache, cough, loose motions, vomiting, rash\n\n"
        "Or visit your nearest PHC directly."
    ),
    "disease": None,
    "triage": None,
    "steps_hi": [],
    "steps_en": [],
}

TRIAGE_LABELS = {
    "home": {"hi": "🏠 घर पर आराम करें", "en": "🏠 Rest at Home"},
    "phc": {"hi": "🏥 PHC जाएं (24 घंटे में)", "en": "🏥 Visit PHC (within 24 h)"},
    "urgent": {"hi": "🚨 तुरंत अस्पताल जाएं", "en": "🚨 Go to Hospital Immediately"},
}


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    message: str
    lang: str = "hi"   # 'hi' | 'en'


class ChatResponse(BaseModel):
    role: str
    message_hi: str
    message_en: str
    disease: str | None
    disease_name_hi: str | None
    disease_name_en: str | None
    triage: str | None
    triage_label_hi: str | None
    triage_label_en: str | None
    steps_hi: list[str]
    steps_en: list[str]


# ---------------------------------------------------------------------------
# Core matching logic
# ---------------------------------------------------------------------------

def _match_disease(text: str) -> dict | None:
    text_lower = text.lower()
    for rule in DISEASE_RULES:
        for kw in rule["keywords"]:
            if kw.lower() in text_lower:
                return rule
    return None


def _build_response(rule: dict) -> dict:
    triage = rule["triage"]
    triage_labels = TRIAGE_LABELS.get(triage, {"hi": "", "en": ""})
    return {
        "role": "assistant",
        "message_hi": (
            f"**{rule['name_hi']}** के लक्षण मिले। 🔍\n\n"
            f"{rule['advice_hi']}"
        ),
        "message_en": (
            f"Symptoms match **{rule['name_en']}**. 🔍\n\n"
            f"{rule['advice_en']}"
        ),
        "disease": rule["id"],
        "disease_name_hi": rule["name_hi"],
        "disease_name_en": rule["name_en"],
        "triage": triage,
        "triage_label_hi": triage_labels["hi"],
        "triage_label_en": triage_labels["en"],
        "steps_hi": rule["steps_hi"],
        "steps_en": rule["steps_en"],
    }


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post("/message", response_model=ChatResponse)
async def chat_message(body: ChatMessage):
    """
    Accepts a user message and returns a disease-recognition response.
    Matching is keyword-based and fully offline — no external API needed.
    """
    text = body.message.strip()

    # Greeting detection
    if GREETING_PATTERNS.search(text) and len(text) < 60:
        return {**GREETING_RESPONSE,
                "disease_name_hi": None,
                "disease_name_en": None,
                "triage_label_hi": None,
                "triage_label_en": None}

    rule = _match_disease(text)

    if rule:
        return _build_response(rule)

    return {**FALLBACK_RESPONSE,
            "disease_name_hi": None,
            "disease_name_en": None,
            "triage_label_hi": None,
            "triage_label_en": None}
