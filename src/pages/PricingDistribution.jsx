import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
/* ================= CONFIG ================= */

const COIN_VALUE = 0.2;

const AUDIO_RATE = 10; // coins per minute
const AUDIO_HOST_SHARE = 7;
const AUDIO_AGENT_SHARE = 3;

const VIDEO_RATE = 35; // normal coins/min
const VIDEO_WEEKEND_PRICE = 100; // ₹100 for 10 min
const VIDEO_AGENT_COMMISSION = 10;

/* ================= TRANSLATIONS ================= */

const I18N = {
  en: {
    title: "Pricing Distribution",
    summary: "Distribution Summary",
    audioTitle: "Audio Call Tariff",
    videoTitle: "One-to-One Video Call Tariff",
    callDuration: "Call duration",
    coinsUsed: "Coins used",
    totalValue: "Total value",
    agentEarns: "Agent earns",
    hostEarns: "Host earns",
    weekendOffer: "Weekend Offer",
    notesTitle: "Important Payout Notes",
    notes: [
      "Minimum payout threshold is 5,000 coins.",
      // "Payouts are processed every Sunday.",
      // "If you send gifts to others, the platform is not responsible.",
      // "Gift value should be more than 20 coins then only coins will be added to host.",
      "Weekend offer: Video call ₹100 for 10 minutes on Saturday and Sunday.",
    ],
  },

  hi: {
    title: "मूल्य वितरण",
    summary: "वितरण सारांश",
    audioTitle: "ऑडियो कॉल शुल्क",
    videoTitle: "वन-टू-वन वीडियो कॉल शुल्क",
    callDuration: "कॉल अवधि",
    coinsUsed: "कॉइन उपयोग",
    totalValue: "कुल मूल्य",
    agentEarns: "एजेंट कमाई",
    hostEarns: "होस्ट कमाई",
    weekendOffer: "वीकेंड ऑफर",
    notesTitle: "महत्वपूर्ण भुगतान नियम",
    notes: [
      "न्यूनतम भुगतान 5,000 कॉइन है।",
      // "हर रविवार भुगतान किया जाएगा।",
      // "गिफ्ट भेजने की जिम्मेदारी प्लेटफॉर्म की नहीं है।",
      // "गिफ्ट का मूल्य 20 कॉइन से अधिक होना चाहिए।",
      "वीकेंड ऑफर: शनिवार और रविवार को 10 मिनट वीडियो कॉल ₹100।",
    ],
  },

  kn: {
    title: "ಬೆಲೆ ಹಂಚಿಕೆ",
    summary: "ಹಂಚಿಕೆ ಸಾರಾಂಶ",
    audioTitle: "ಆಡಿಯೋ ಕಾಲ್ ಶುಲ್ಕ",
    videoTitle: "ಒನ್-ಟು-ಒನ್ ವೀಡಿಯೋ ಕಾಲ್ ಶುಲ್ಕ",
    callDuration: "ಕಾಲ್ ಅವಧಿ",
    coinsUsed: "ಬಳಸಿದ ನಾಣ್ಯಗಳು",
    totalValue: "ಒಟ್ಟು ಮೌಲ್ಯ",
    agentEarns: "ಏಜೆಂಟ್ ಗಳಿಕೆ",
    hostEarns: "ಹೋಸ್ಟ್ ಗಳಿಕೆ",
    weekendOffer: "ವಾರಾಂತ್ಯ ಆಫರ್",
    notesTitle: "ಮುಖ್ಯ ಪಾವತಿ ಸೂಚನೆಗಳು",
    notes: [
      "ಕನಿಷ್ಠ ಪಾವತಿ 5,000 ನಾಣ್ಯಗಳು.",
      // "ಪ್ರತಿ ಭಾನುವಾರ ಪಾವತಿ.",
      // "ಗಿಫ್ಟ್‌ಗಳಿಗೆ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಹೊಣೆಗಾರವಲ್ಲ.",
      // "ಗಿಫ್ಟ್ ಮೌಲ್ಯ 20 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಇರಬೇಕು.",
      "ವಾರಾಂತ್ಯ ಆಫರ್: ಶನಿವಾರ ಮತ್ತು ಭಾನುವಾರ 10 ನಿಮಿಷ ವೀಡಿಯೋ ಕಾಲ್ ₹100.",
    ],
  },

  ta: {
    title: "விலை பகிர்வு",
    summary: "பகிர்வு சுருக்கம்",
    audioTitle: "ஆடியோ அழைப்பு கட்டணம்",
    videoTitle: "ஒன்-டூ-ஒன் வீடியோ அழைப்பு கட்டணம்",
    callDuration: "அழைப்பு நேரம்",
    coinsUsed: "நாணயங்கள்",
    totalValue: "மொத்த மதிப்பு",
    agentEarns: "முகவர் வருமானம்",
    hostEarns: "ஹோஸ்ட் வருமானம்",
    weekendOffer: "வார இறுதி சலுகை",
    notesTitle: "முக்கிய குறிப்புகள்",
    notes: [
      "குறைந்தபட்சம் 5,000 நாணயங்கள் தேவை.",
      // "ஒவ்வொரு ஞாயிற்றுக்கிழமையும் பணம் வழங்கப்படும்.",
      // "பரிசுகளுக்கு தளம் பொறுப்பல்ல.",
      // "பரிசின் மதிப்பு 20 நாணயங்களை மீற வேண்டும்.",
      "வார இறுதி: 10 நிமிடம் வீடியோ அழைப்பு ₹100.",
    ],
  },

  te: {
    title: "ధర పంపిణీ",
    summary: "పంపిణీ సారాంశం",
    audioTitle: "ఆడియో కాల్ ఛార్జ్",
    videoTitle: "వన్-టు-వన్ వీడియో కాల్ ఛార్జ్",
    callDuration: "కాల వ్యవధి",
    coinsUsed: "నాణేలు",
    totalValue: "మొత్తం విలువ",
    agentEarns: "ఏజెంట్ ఆదాయం",
    hostEarns: "హోస్ట్ ఆదాయం",
    weekendOffer: "వీకెండ్ ఆఫర్",
    notesTitle: "ముఖ్య గమనికలు",
    notes: [
      "కనీసం 5,000 నాణేలు అవసరం.",
      // "ప్రతి ఆదివారం చెల్లింపులు.",
      // "గిఫ్ట్‌లకు ప్లాట్‌ఫాం బాధ్యత కాదు.",
      // "గిఫ్ట్ విలువ 20 కంటే ఎక్కువ కావాలి.",
      "వీకెండ్: 10 నిమిషాల వీడియో కాల్ ₹100.",
    ],
  },

  ml: {
    title: "വില വിതരണം",
    summary: "വിതരണ സംഗ്രഹം",
    audioTitle: "ഓഡിയോ കോൾ നിരക്ക്",
    videoTitle: "വൺ-ടു-വൺ വീഡിയോ കോൾ നിരക്ക്",
    callDuration: "കോൾ ദൈർഘ്യം",
    coinsUsed: "നാണയങ്ങൾ",
    totalValue: "മൊത്തം മൂല്യം",
    agentEarns: "ഏജന്റ് വരുമാനം",
    hostEarns: "ഹോസ്റ്റ് വരുമാനം",
    weekendOffer: "വീക്കൻഡ് ഓഫർ",
    notesTitle: "പ്രധാനപ്പെട്ട കുറിപ്പുകൾ",
    notes: [
      "കുറഞ്ഞത് 5,000 നാണയങ്ങൾ വേണം.",
      // "എല്ലാ ഞായറാഴ്ചയും പേയൗട്ട്.",
      // "ഗിഫ്റ്റുകൾക്ക് പ്ലാറ്റ്ഫോം ഉത്തരവാദിയല്ല.",
      // "ഗിഫ്റ്റ് മൂല്യം 20 ന് മുകളിൽ വേണം.",
      "വീക്കൻഡ് ഓഫർ: 10 മിനിറ്റ് വീഡിയോ കോൾ ₹100.",
    ],
  },
};

/* ================= COMPONENT ================= */

export default function PricingDistribution() {
  const pdfRef = useRef(null);
  const { type } = useParams();
  const isAgent = type === "agent";

  const [lang, setLang] = useState("en");

  const t = (k) => I18N[lang][k];

  /* AUDIO CALL */

  const audioMinutes = 10;

  const audioCoins = audioMinutes * AUDIO_RATE;
  const audioValue = audioCoins * COIN_VALUE;

  const audioHostCoins = isAgent ? audioMinutes * AUDIO_HOST_SHARE : audioCoins;

  const audioAgentCoins = isAgent ? audioMinutes * AUDIO_AGENT_SHARE : 0;

  const audioHostValue = audioHostCoins * COIN_VALUE;
  const audioAgentValue = audioAgentCoins * COIN_VALUE;

  /* VIDEO CALL */

  const videoMinutes = 10;

  const isWeekend = (() => {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  })();

  let videoPrice = videoMinutes * VIDEO_RATE * COIN_VALUE;
  let videoAgent = 0;
  let videoHost = videoPrice;

  if (isWeekend) {
    videoPrice = VIDEO_WEEKEND_PRICE;

    if (isAgent) {
      videoAgent = VIDEO_AGENT_COMMISSION;
      videoHost = videoPrice - videoAgent;
    } else {
      videoHost = videoPrice;
    }
  } else {
    if (isAgent) {
      videoAgent = 7;
      videoHost = videoPrice - videoAgent;
    } else {
      videoHost = videoPrice;
    }
  }



  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}

        <div className="bg-white p-4 rounded-xl shadow flex justify-between">
          <h1 className="text-xl font-bold">{t("title")}</h1>
        
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="kn">Kannada</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
            <option value="ml">Malayalam</option>
          </select>
        </div>

        {/* CONTENT */}

        <div ref={pdfRef} className="bg-white p-6 rounded-xl shadow space-y-6">
          <h2 className="text-lg font-bold">{t("summary")}</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* AUDIO CARD */}

            <Card title={`🎧 ${t("audioTitle")}`}>
              <Row label={t("callDuration")} value={`${audioMinutes} min`} />
              <Row label={t("coinsUsed")} value={`${isAgent?"30":audioCoins} coins`} />
              {!isAgent&&(
              <Row label={t("totalValue")} value={`₹${audioValue}`} />
              )}
               
              

              {isAgent && (
                <>
                <Divider />
                <Row label={t("agentEarns")} value={`₹${audioAgentValue}`} />
                </>
              )}

              {/* <Row
                label={t("hostEarns")}
                value={`₹${audioHostValue}`}
                highlight
              /> */}
            </Card>

            {/* VIDEO CARD */}

            <Card title={`📹 ${t("videoTitle")}`}>
              <Row label={t("callDuration")} value={`${videoMinutes} min`} />

              {/* <Row label={t("weekendOffer")} value="₹100 / 10 min" /> */}
              <Row label={t("coinsUsed")} value={`${isAgent?50:350}  ${!isAgent?"/ 500 (Top Host)":""}  `} />
              {/* {!isAgent&&(
              <Row label={t("totalValue")} value={`₹${videoPrice}`} />
              )} */}

              <Divider />

              {isAgent && (
                <Row label={t("agentEarns")} value={`₹${10}`} />
              )}
               {!isAgent&&(
              <Row label={t("hostEarns")} value={`₹${videoHost}/₹100 (Top Host)`} highlight />
              )}
            </Card>
          </div>

          {/* NOTES */}

          <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded-lg">
            <h3 className="font-bold text-amber-800 mb-2">
              ⚠️ {t("notesTitle")}
            </h3>

            <ul className="list-disc pl-5 text-sm text-amber-900">
              {I18N[lang].notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= UI HELPERS ================= */

const Card = ({ title, children }) => (
  <div className="border rounded-lg p-4 space-y-2">
    <h3 className="font-semibold text-gray-800">{title}</h3>
    {children}
  </div>
);

const Row = ({ label, value, highlight }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">{label}</span>
    <span className={highlight ? "font-bold text-green-600" : "font-medium"}>
      {value}
    </span>
  </div>
);

const Divider = () => <hr className="my-2 border-gray-200" />;
