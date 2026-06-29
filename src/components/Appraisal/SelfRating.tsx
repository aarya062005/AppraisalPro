import { useState } from "react";

const ratingLabels: Record<number, string> = {
  1: "Below expectations",
  2: "Needs improvement",
  3: "Meets expectations",
  4: "Exceeds expectations",
  5: "Outstanding",
};

export default function SelfRating() {
  const [rating, setRating] = useState(4);
  const [hovered, setHovered] = useState<number | null>(null);

  const active = hovered ?? rating;

  return (
    <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4 mb-4">
      {/* Section Title */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
        <span className="text-white text-sm font-semibold uppercase tracking-widest">
          Self Rating
        </span>
      </div>

      {/* Guide text */}
      <p className="text-[#6b7280] text-xs mb-4">
        Rate yourself honestly. A 4/5 with strong examples beats a 5/5 with none.
        <span className="italic text-[#4b5563] ml-1">
          e.g. 4 = Exceeds expectations · 3 = Meets expectations
        </span>
      </p>

      {/* Stars */}
      <div className="flex items-center gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            className="transition-transform hover:scale-110"
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

        {/* Rating value */}
        <span className="text-white text-sm font-semibold ml-1">
          {rating}/5
        </span>
        <span className="text-[#6b7280] text-sm">
          — {ratingLabels[rating]}
        </span>
      </div>

      {/* Reason */}
      <p className="text-[#6b7280] text-xs mt-3">
        Chose {rating} because I delivered all goals but had estimation issues that caused minor delays.
      </p>

      {/* Rating Scale */}
      <div className="mt-5">
        <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-3">Rating Scale</p>
        <div className="flex gap-4 flex-wrap">
          {Object.entries(ratingLabels).map(([value, label]) => (
            <div key={value} className="flex flex-col items-center gap-1">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} width="12" height="12" viewBox="0 0 24 24"
                    fill={s <= Number(value) ? "#a855f7" : "none"}
                    stroke={s <= Number(value) ? "#a855f7" : "#374151"}
                    strokeWidth="1.5"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="text-[#6b7280] text-[10px] text-center w-16">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}