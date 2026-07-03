import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchAppraisalById, saveSelfAssessmentDraft, submitSelfAssessment } from "../../api/authApi";

type AppraisalStatus =
  | "PENDING"
  | "EMPLOYEE_DRAFT"
  | "SELF_SUBMITTED"
  | "MANAGER_DRAFT"
  | "MANAGER_REVIEWED"
  | "APPROVED"
  | "ACKNOWLEDGED";

interface AppraisalDetail {
  appraisalId: number;
  cycleName: string;
  cycleStartDate: string;
  cycleEndDate: string;
  managerName: string;
  managerEmail: string;
  whatWentWell: string | null;
  whatToImprove: string | null;
  achievements: string | null;
  selfRating: number | null;
  appraisalStatus: AppraisalStatus;
}

const STATUS_LABELS: Record<AppraisalStatus, string> = {
  PENDING: "Pending",
  EMPLOYEE_DRAFT: "Draft",
  SELF_SUBMITTED: "Submitted",
  MANAGER_DRAFT: "Manager Draft",
  MANAGER_REVIEWED: "Manager Reviewed",
  APPROVED: "Approved",
  ACKNOWLEDGED: "Acknowledged",
};

const statusStyles: Record<AppraisalStatus, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  EMPLOYEE_DRAFT: "bg-[#2a2d3a] text-[#6b7280] border border-white/[0.06]",
  SELF_SUBMITTED: "bg-green-500/10 text-green-400 border border-green-500/20",
  MANAGER_DRAFT: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  MANAGER_REVIEWED: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
  APPROVED: "bg-green-500/10 text-green-400 border border-green-500/20",
  ACKNOWLEDGED: "bg-green-500/10 text-green-400 border border-green-500/20",
};

const MAX_CHARS = 500;

export default function ManagerSelfAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appraisal, setAppraisal] = useState<AppraisalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    whatWentWell: "",
    whatToImprove: "",
    achievements: "",
    rating: 0,
  });
  const [hovered, setHovered] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchAppraisalById(Number(id))
      .then((data) => {
        setAppraisal(data);
        setForm({
          whatWentWell: data.whatWentWell || "",
          whatToImprove: data.whatToImprove || "",
          achievements: data.achievements || "",
          rating: data.selfRating || 0,
        });
      })
      .catch(() => setError("Failed to load appraisal."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center h-64">
        <p className="text-[#6b7280]">Loading...</p>
      </div>
    );
  }

  if (error || !appraisal) {
    return <div className="text-red-400 p-6">{error || "Appraisal not found."}</div>;
  }

  const submitted =
    appraisal.appraisalStatus !== "PENDING" &&
    appraisal.appraisalStatus !== "EMPLOYEE_DRAFT";

  const completedFields = [
    form.whatWentWell.trim().length > 0,
    form.whatToImprove.trim().length > 0,
    form.achievements.trim().length > 0,
    form.rating > 0,
  ].filter(Boolean).length;

  const handleChange = (
    field: "whatWentWell" | "whatToImprove" | "achievements",
    value: string
  ) => {
    if (value.length <= MAX_CHARS) {
      setForm((prev) => ({ ...prev, [field]: value }));
      setSaved(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!appraisal) return;
    setSaving(true);
    setSubmitError("");
    try {
      await saveSelfAssessmentDraft(appraisal.appraisalId, {
        whatWentWell: form.whatWentWell,
        whatToImprove: form.whatToImprove,
        achievements: form.achievements,
        selfRating: form.rating,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setSubmitError(err.response?.data || "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!appraisal) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const updated = await submitSelfAssessment(appraisal.appraisalId, {
        whatWentWell: form.whatWentWell,
        whatToImprove: form.whatToImprove,
        achievements: form.achievements,
        selfRating: form.rating,
      });
      setAppraisal((prev) =>
        prev ? { ...prev, appraisalStatus: updated.appraisalStatus } : prev
      );
    } catch (err: any) {
      setSubmitError(err.response?.data || "Failed to submit assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  const active = hovered ?? form.rating;

  return (
    <div className="w-full max-w-3xl">
      {/* Back */}
      <button
        onClick={() => navigate("/manager/my-appraisals")}
        className="flex items-center gap-2 text-[#6b7280] hover:text-white text-sm mb-6 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M10 4L6 8l4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to My Appraisals
      </button>

      {/* Appraisal Details */}
      <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-6 py-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[#6b7280] text-xs uppercase tracking-widest font-medium">
            Appraisal Details
          </p>
          <span
            className={`text-xs font-medium px-3 py-1 rounded-lg ${statusStyles[appraisal.appraisalStatus]}`}
          >
            {STATUS_LABELS[appraisal.appraisalStatus]}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Cycle</p>
            <p className="text-white text-sm font-semibold">{appraisal.cycleName}</p>
          </div>
          <div>
            <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Reviewer</p>
            <p className="text-white text-sm font-semibold">{appraisal.managerName}</p>
            <p className="text-[#6b7280] text-xs">{appraisal.managerEmail}</p>
          </div>
          <div>
            <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Start Date</p>
            <p className="text-white text-sm font-semibold">{appraisal.cycleStartDate}</p>
          </div>
          <div>
            <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">End Date</p>
            <p className="text-white text-sm font-semibold">{appraisal.cycleEndDate}</p>
          </div>
        </div>
      </div>

      {/* Self Assessment Form */}
      <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-6 py-5 mb-4">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[#6b7280] text-xs uppercase tracking-widest font-medium">
            Self Assessment
          </p>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-8 h-1 rounded-full ${
                    i <= completedFields ? "bg-purple-500" : "bg-[#2a2d3a]"
                  }`}
                />
              ))}
            </div>
            <span className="text-[#6b7280] text-xs">{completedFields} of 4 completed</span>
          </div>
        </div>

        {/* What Went Well */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-white text-sm font-medium">What Went Well</label>
            <span className="text-[#6b7280] text-xs">
              {form.whatWentWell.length} / {MAX_CHARS}
            </span>
          </div>
          <textarea
            value={form.whatWentWell}
            onChange={(e) => handleChange("whatWentWell", e.target.value)}
            placeholder="Describe what went well this cycle..."
            rows={4}
            disabled={submitted}
            className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-[#4b5563] text-sm outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none disabled:opacity-50"
          />
        </div>

        {/* What To Improve */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-white text-sm font-medium">What To Improve</label>
            <span className="text-[#6b7280] text-xs">
              {form.whatToImprove.length} / {MAX_CHARS}
            </span>
          </div>
          <textarea
            value={form.whatToImprove}
            onChange={(e) => handleChange("whatToImprove", e.target.value)}
            placeholder="Describe areas you want to improve..."
            rows={4}
            disabled={submitted}
            className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-[#4b5563] text-sm outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none disabled:opacity-50"
          />
        </div>

        {/* Achievements */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-white text-sm font-medium">Achievements</label>
            <span className="text-[#6b7280] text-xs">
              {form.achievements.length} / {MAX_CHARS}
            </span>
          </div>
          <textarea
            value={form.achievements}
            onChange={(e) => handleChange("achievements", e.target.value)}
            placeholder="List your key achievements this cycle..."
            rows={4}
            disabled={submitted}
            className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-[#4b5563] text-sm outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none disabled:opacity-50"
          />
        </div>

        {/* Self Rating */}
        <div className="mb-5">
          <label className="text-white text-sm font-medium block mb-2">Self Rating</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() =>
                  !submitted && setForm((prev) => ({ ...prev, rating: star }))
                }
                onMouseEnter={() => !submitted && setHovered(star)}
                onMouseLeave={() => setHovered(null)}
                disabled={submitted}
                className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill={star <= active ? "#a855f7" : "none"}
                  stroke={star <= active ? "#a855f7" : "#374151"}
                  strokeWidth="1.5"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
            {form.rating === 0 && (
              <span className="text-[#4b5563] text-xs ml-1">
                Click a star to rate yourself
              </span>
            )}
          </div>
        </div>

        {submitError && (
          <div className="mb-4 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-xs">{submitError}</p>
          </div>
        )}

        {/* Actions */}
        {!submitted ? (
          <div className="flex gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.08] text-[#9ca3af] text-sm font-medium hover:bg-white/[0.04] transition-all disabled:opacity-60"
            >
              {saving ? "Saving..." : saved ? "✓ Saved!" : "💾 Save Draft"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || completedFields < 4}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "✓ Submit Assessment"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8l4 4 6-7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Assessment submitted successfully!
          </div>
        )}
      </div>
    </div>
  );
}