"use client";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  count?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function StarRating({
  rating,
  max = 5,
  size = "sm",
  showValue = false,
  count,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  const iconClass = sizeClasses[size];

  return (
    <div className="inline-flex items-center gap-1">
      <div
        className="flex"
        role={interactive ? "radiogroup" : "img"}
        aria-label={interactive ? "Rating" : `${rating} out of ${max} stars`}
      >
        {stars.map((star) => {
          const filled = star <= Math.round(rating);

          if (interactive) {
            return (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={star === Math.round(rating)}
                aria-label={`${star} star${star !== 1 ? "s" : ""}`}
                onClick={() => onChange?.(star)}
                className={`${filled ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400 hover:scale-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded`}
              >
                <svg
                  className={iconClass}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </button>
            );
          }

          return (
            <svg
              key={star}
              className={`${iconClass} ${filled ? "text-yellow-400" : "text-gray-300"}`}
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          );
        })}
      </div>
      {showValue && rating > 0 && (
        <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
      )}
      {count !== undefined && (
        <span className="text-sm text-gray-500">
          ({count})
        </span>
      )}
    </div>
  );
}
