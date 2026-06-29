export default function WhatWentWell() {
  return (
    <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4 mb-4">
      {/* Section Title */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
        <span className="text-white text-sm font-semibold uppercase tracking-widest">
          What Went Well
        </span>
      </div>

      {/* Guide text */}
      <p className="text-[#6b7280] text-xs mb-3">
        Your top 2–3 contributions. Focus on impact, not just activity.
        <span className="italic text-[#4b5563] ml-1">
          e.g. Led the JWT migration on time, mentored 2 juniors.
        </span>
      </p>

      {/* Content */}
      <p className="text-[#9ca3af] text-sm leading-relaxed">
        Led the JWT authentication migration on time, completing it within the
        sprint. Collaborated closely with the backend team to ensure zero
        downtime. Mentored 2 junior developers on REST API best practices,
        improving code review turnaround by 30%.
      </p>
    </div>
  );
}