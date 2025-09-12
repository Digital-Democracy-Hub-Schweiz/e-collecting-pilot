import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

export type MediaItem = {
  id: string;
  title: string;
  summary?: string;
  dateRange?: string;
  url: string;
  image?: string;
  level?: string;
  type?: "Initiative" | "Referendum" | string;
};

type MediaCarouselProps = {
  heading: string;
  items: MediaItem[];
};

export const MediaCarousel: React.FC<MediaCarouselProps> = ({ heading, items }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false, dragFree: true });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  type OnSelectApi = {
    selectedScrollSnap: () => number;
    canScrollPrev: () => boolean;
    canScrollNext: () => boolean;
  };
  const onSelect = useCallback((api: OnSelectApi) => {
    setSelectedIndex(api.selectedScrollSnap());
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <div className="w-full">
      <div className="max-w-[2000px] mx-auto px-[163px] py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[40px] leading-[48px] font-semibold text-[#1f2937]">{heading}</h2>
          <div className="hidden sm:flex items-center gap-2">
            <button
              aria-label="Vorherige"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-[#e0e4e8] bg-white text-[#1f2937] disabled:opacity-40 hover:bg-[#f5f6f7]"
            >
              {/* Placeholder for small-screen controls (keine Figma-Vektoren hier) */}
              <span className="sr-only">Vorherige</span>
            </button>
            <button
              aria-label="Nächste"
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-[#e0e4e8] bg-white text-[#1f2937] disabled:opacity-40 hover:bg-[#f5f6f7]"
            >
              {/* Placeholder for small-screen controls (keine Figma-Vektoren hier) */}
              <span className="sr-only">Nächste</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-16">
            {items.map((item) => (
              <div key={item.id} className="flex-[0_0_85%] sm:flex-[0_0_60%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%]">
                <a href={item.url} className="block h-full">
                  <article className="group h-full bg-white shadow-[0px_2px_6px_-1px_rgba(17,24,39,0.08)] rounded-[2px] overflow-hidden">
                    <div className="p-7 space-y-3">
                      <div className="flex items-center gap-2 text-[14px] leading-[18px] text-[#6b7280]">
                        <span className="font-medium">{item.type || 'Artikel'}</span>
                        {item.dateRange && (
                          <span className="flex items-center gap-2">
                            <span className="text-[#6b7280]">|</span>
                            <span>{item.dateRange}</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-[24px] leading-[1.25] font-semibold text-[#1f2937] line-clamp-2">
                        {item.title}
                      </h3>
                      {item.summary && (
                        <p className="text-[18px] leading-[28px] text-[#1f2937] line-clamp-3">{item.summary}</p>
                      )}
                    </div>
                    <div className="p-7">
                      <div className="text-[18px] leading-[28px] text-[#6b7280]">PDF · Deutsch</div>
                    </div>
                  </article>
                </a>
              </div>
            ))}
            </div>
          </div>
          {/* Pfeile gemäss Figma */}
          <button
            aria-label="Vorherige"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="hidden md:flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 h-24 w-24 overflow-hidden disabled:opacity-40"
          >
            {/* Vector mit Insets laut Figma */}
            <div className="absolute inset-[22.2%_38.61%_19.1%_41.74%]">
              <img
                src="http://localhost:3845/assets/6b46edee1d87cc08aa8dd4eacdf200dcfce8d7b2.svg"
                alt=""
                className="block max-w-none w-full h-full"
              />
            </div>
          </button>
          <button
            aria-label="Nächste"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="hidden md:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 h-24 w-24 overflow-hidden disabled:opacity-40"
          >
            {/* Vector mit Insets laut Figma */}
            <div className="absolute inset-[22.2%_38.61%_19.1%_41.74%]">
              <img
                src="http://localhost:3845/assets/40585baafb97e5aaf5dde64d0eb65758494c5a88.svg"
                alt=""
                className="block max-w-none w-full h-full"
              />
            </div>
          </button>
        </div>

        {/* Dots gemäss Figma */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {items.map((_, index) => (
            <button
              key={index}
              aria-label={`Slide ${index + 1}`}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-[10px] w-[10px] rounded-full ${selectedIndex === index ? "bg-[#1f2937]" : "bg-[#e0e4e8]"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};


