import { useState } from "react";

const cycleInfo = {
  cycle: "FY-2028",
  period: "Jan 1 — Dec 1, 2028",
  status: "Pending",
  manager: "Doremon",
};

export default function SelfAssessmentForm() {
  const [form, setForm] = useState({
    whatWentWell: "",
    whatToImprove: "",
    keyAchievements: "",
    rating: 0,
  });
  const [hovered, setHovered] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSaveDraft = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const active = hovered ?? form.rating;

  if (submitted) {
    return (
      <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-10 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-white font-semibold">Submitted to Manager!</p>
        <p className="text-[#6b7280] text-sm text-center">
          Your self assessment has been submitted to {cycleInfo.manager}. The form is now locked.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Cycle Info */}
      <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Cycle</p>
          <p className="text-white text-sm font-medium">{cycleInfo.cycle}</p>
        </div>
        <div>
          <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Period</p>
          <p className="text-white text-sm font-medium">{cycleInfo.period}</p>
        </div>
        <div>
          <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Status</p>
          <span className="text-xs font-medium text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-lg">
            {cycleInfo.status}
          </span>
        </div>
        <div>
          <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Manager</p>
          <p className="text-white text-sm font-medium">{cycleInfo.manager}</p>
        </div>
      </div>

      {/* Form Title */}
      <div className="px-1">
        <h2 className="text-white text-base font-semibold">Fill Your Self Assessment</h2>
        <p className="text-[#6b7280] text-xs mt-0.5">
          Save Draft keeps your progress. Submit sends it to your manager and locks the form.
        </p>
      </div>

      {/* What Went Well */}
      <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <label className="text-white text-sm font-semibold">
            What Went Well <span className="text-red-400">*</span>
          </label>
        </div>
        <textarea
          value={form.whatWentWell}
          onChange={(e) => handleChange("whatWentWell", e.target.value)}
          placeholder="Describe your key contributions and successes..."
          rows={4}
          className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-[#4b5563] text-sm outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none"
        />
      </div>

      {/* What Could I Improve */}
      <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <label className="text-white text-sm font-semibold">
            What Could I Improve <span className="text-red-400">*</span>
          </label>
        </div>
        <textarea
          value={form.whatToImprove}
          onChange={(e) => handleChange("whatToImprove", e.target.value)}
          placeholder="Be honest about areas where you could have done better..."
          rows={4}
          className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-[#4b5563] text-sm outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none"
        />
      </div>

      {/* Key Achievements */}
      <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <label className="text-white text-sm font-semibold">
            Key Achievements <span className="text-red-400">*</span>
          </label>
        </div>
        <textarea
          value={form.keyAchievements}
          onChange={(e) => handleChange("keyAchievements", e.target.value)}
          placeholder="List specific achievements, metrics, projects completed..."
          rows={4}
          className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-[#4b5563] text-sm outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none"
        />
      </div>

      {/* Self Rating */}
      <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <label className="text-white text-sm font-semibold">
            Self Rating <span className="text-red-400">*</span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setForm((prev) => ({ ...prev, rating: star }))}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(null)}
              className="transition-transform hover:scale-110"
            >
              <svg width="28" height="28" viewBox="0 0 24 24"
                fill={star <= active ? "#a855f7" : "none"}
                stroke={star <= active ? "#a855f7" : "#374151"}
                strokeWidth="1.5"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
          {form.rating > 0 && (
            <span className="text-[#6b7280] text-sm ml-1">
              {form.rating}/5
            </span>
          )}
        </div>
        {form.rating === 0 && (
          <p className="text-[#4b5563] text-xs mt-2">Click a star to rate yourself</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSaveDraft}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.08] text-[#9ca3af] text-sm font-medium hover:bg-white/[0.04] transition-all"
        >
          {saved ? "✓ Saved!" : "💾 Save Draft"}
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all"
        >
          ✓ Submit to Manager
        </button>
      </div>
    </div>
  );
}