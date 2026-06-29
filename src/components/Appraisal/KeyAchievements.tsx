const achievements = [
  "Delivered JWT auth module (Q1 sprint goal)",
  "Reduced API response time by 35% through query optimization",
  "Completed AWS Cloud Practitioner certification",
  "Resolved 12 critical backlog bugs",
  "Onboarded and mentored 2 new team members",
];

export default function KeyAchievements() {
  return (
    <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4 mb-4">
      {/* Section Title */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
        <span className="text-white text-sm font-semibold uppercase tracking-widest">
          Key Achievements
        </span>
      </div>

      {/* Guide text */}
      <p className="text-[#6b7280] text-xs mb-3">
        Specific wins — features shipped, certs earned, problems solved.
        <span className="italic text-[#4b5563] ml-1">
          e.g. Delivered auth module, Completed AWS cert, Resolved 12 bugs.
        </span>
      </p>

      {/* Achievements list */}
      <ul className="flex flex-col gap-2">
        {achievements.map((item, index) => (
          <li key={index} className="flex items-start gap-2.5">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
            <span className="text-[#9ca3af] text-sm leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}