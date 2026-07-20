import { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";

const ALL_LANGUAGES = [
  { code: "en", name: "English", symbol: "A" },
  { code: "hi", name: "Hindi", symbol: "ह" },
  { code: "kn", name: "Kannada", symbol: "ಕ" },
  { code: "ml", name: "Malayalam", symbol: "മ" },
  { code: "ta", name: "Tamil", symbol: "த" },
  { code: "te", name: "Telugu", symbol: "త" },
  { code: "gu", name: "Gujarati", symbol: "બ" },
  { code: "bn", name: "Bengali", symbol: "ব" },
  { code: "mr", name: "Marathi", symbol: "म" },
  { code: "pa", name: "Punjabi", symbol: "ਓ" },
  { code: "or", name: "Odia", symbol: "ଓ" },
  { code: "ur", name: "Urdu", symbol: "ا" },
];

export default function LanguageEditor({ user, onUpdated }) {
  const nameToCode = (name) => {
    const found = ALL_LANGUAGES.find(
      (l) => l.name.toLowerCase() === name.toLowerCase(),
    );
    return found ? found.name : name;
  };
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState(
    (user.language || []).map(nameToCode),
  );
  useEffect(() => {
    setSelected((user.language || []).map(nameToCode));
  }, [user.language]);
  const toggleLang = (code) => {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code],
    );
  };

  const updateLanguages = async () => {
    try {
      setLoading(true);

      await axios.post(`${BaseUrl.baseurl}/user/update-languages/${user._id}`, {
        language: selected,
      });

      setEditing(false);
      onUpdated && onUpdated();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update languages");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-gray-800 font-semibold">🌐 Languages</h4>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1 text-xs rounded bg-indigo-600 text-white"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={updateLanguages}
              disabled={loading}
              className="px-3 py-1 text-xs rounded bg-green-600 text-white"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1 text-xs rounded bg-gray-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* VIEW MODE */}
      {!editing && (
        <div className="flex flex-wrap gap-2">
          {user.language?.length ? (
            user.language.map((lang, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-xs rounded-full bg-sky-100 text-sky-700 font-medium"
              >
                {lang}
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-400">No languages added</p>
          )}
        </div>
      )}

      {/* EDIT MODE */}
      {editing && (
        <div className="flex flex-wrap gap-2">
          {ALL_LANGUAGES.map((lang) => {
            const active = selected.includes(lang.name);

            return (
              <button
                key={lang.code}
                onClick={() => toggleLang(lang.name)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition ${
                  active
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                <span className="text-lg">{lang.symbol}</span>
                {lang.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
