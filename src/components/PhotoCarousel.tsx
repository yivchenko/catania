import { useState, useEffect } from "react";
import type { GuideImage } from "../types/guide";

type PhotoCarouselProps = {
  images: GuideImage[];
  className?: string;
};

export function PhotoCarousel({ images, className = "" }: PhotoCarouselProps) {
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Reset index when images list changes (e.g. card is recycled for another place)
  useEffect(() => {
    setIndex(0);
  }, [images]);

  const current = images[index] ?? images[0];

  if (!current) return null;

  const goPrev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setIndex((i) => (i + 1) % images.length);

  // Mobile swipe handlers
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      goNext();
    } else if (isRightSwipe) {
      goPrev();
    }
  };

  return (
    <div 
      className={`relative w-full h-full overflow-hidden rounded-card bg-ink-200 dark:bg-ink-700 ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={current.url}
        alt={current.alt}
        className="h-full w-full object-cover"
        loading="lazy"
      />

      {images.length > 1 && (
        <>
          {/* Стрілки з боків — щоб не накладатися на назву місця внизу картки */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="tap-highlight absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur active:bg-black/60"
            aria-label="Попереднє фото"
          >
            ←
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="tap-highlight absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur active:bg-black/60"
            aria-label="Наступне фото"
          >
            →
          </button>

          {/* Крапки-індикатори зверху */}
          <div className="absolute left-1/2 top-2 z-10 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                type="button"
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-white" : "w-1.5 bg-white/60"} [box-shadow:0_0_4px_rgb(0_0_0/0.5)]`}
                aria-label={`Фото ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

