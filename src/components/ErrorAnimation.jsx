import { useEffect, useState } from "react";

const animations = {
  page: {
    embed:
      "https://lottie.host/embed/2b2766bb-ebe1-4620-aa09-434c80783c95/v5ds5SdfXf.lottie",
    poster:
      "https://assets-v2.lottiefiles.com/a/a9c393d2-9a8d-11ee-9841-0b6515120bc6/nSxbMzOyat.png",
  },
  venue: {
    embed:
      "https://lottie.host/embed/ef381583-0939-467e-97fc-d01bbdcae3bf/bT55THXXKq.lottie",
    poster:
      "https://assets-v2.lottiefiles.com/a/bedb7c58-117b-11ee-a43d-8731fd12ca6b/l3wmKBFom8.png",
  },
};

/**
 * Embeds decorative error artwork, using a still image when reduced motion is preferred.
 * @param {object} props Component props.
 * @param {"page"|"venue"} props.kind Selects the missing-page or missing-venue illustration.
 * @returns {import('react').ReactNode}
 */
export default function ErrorAnimation({ kind }) {
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [finished, setFinished] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Keep decorative motion brief; the illustration remains after playback.
    const timer = window.setTimeout(() => setFinished(true), 5000);
    /**
     * Updates the artwork when the system motion preference changes.
     * @returns {void}
     */
    function updateMotion() {
      setReducedMotion(media.matches);
    }
    media.addEventListener("change", updateMotion);
    return () => {
      window.clearTimeout(timer);
      media.removeEventListener("change", updateMotion);
    };
  }, []);

  const { embed, poster } = animations[kind];
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none mx-auto mb-5 aspect-square w-60 max-w-full sm:w-70"
    >
      {reducedMotion || finished ? (
        <img
          src={poster}
          alt=""
          className="size-full object-contain mix-blend-multiply"
        />
      ) : (
        <iframe
          src={embed}
          title="Decorative travel animation"
          tabIndex={-1}
          referrerPolicy="no-referrer"
          className="size-full border-0"
        />
      )}
    </div>
  );
}
