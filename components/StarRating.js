// shows stars, and lets the user pick a rating when onChange is given
export default function StarRating({ value = 0, onChange, size = "text-xl" }) {
  return (
    <span className={`inline-flex ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(value);
        const star_char = filled ? "★" : "☆";

        // read only stars
        if (!onChange) {
          return (
            <span key={star} className={filled ? "text-yellow-500" : "text-gray-300"}>
              {star_char}
            </span>
          );
        }

        // clickable stars
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={filled ? "text-yellow-500" : "text-gray-300"}
            aria-label={`${star} star`}
          >
            {star_char}
          </button>
        );
      })}
    </span>
  );
}