"use client";
import { useState, useEffect, useRef } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPlay,
  FiPause,
  FiArrowLeft,
} from "react-icons/fi";
import { Conference } from "../../shared/entities/conference";
import { ImageMediaType } from "../../shared/entities/media";

const DEFAULT_IMAGE = "/programmingImg.png";
const SLIDE_INTERVAL_MS = 8000;

function getImageUrls(images?: string[] | ImageMediaType[]): string[] {
  if (!images || images.length === 0) return [DEFAULT_IMAGE];
  const urls = images
    .map((img) => (typeof img === "string" ? img : img.url))
    .filter(Boolean);
  return urls.length > 0 ? urls : [DEFAULT_IMAGE];
}

export interface ConferencePlayViewProps {
  conference: Conference;
  onBack: () => void;
}

export default function ConferencePlayView({
  conference,
  onBack,
}: ConferencePlayViewProps) {
  const imageUrls = getImageUrls(conference.images);
  const hasMultiple = imageUrls.length > 1;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isPlaying && hasMultiple) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((i) => (i + 1) % imageUrls.length);
      }, SLIDE_INTERVAL_MS);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, hasMultiple, imageUrls.length]);

  const handlePrev = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentIndex((i) => (i === 0 ? imageUrls.length - 1 : i - 1));
  };

  const handleNext = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentIndex((i) => (i + 1) % imageUrls.length);
  };

  const togglePlay = () => setIsPlaying((p) => !p);

  return (
    <div className="relative w-full h-screen bg-dark overflow-hidden select-none">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500"
        style={{ backgroundImage: `url(${imageUrls[currentIndex]})` }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-transparentBlack" />

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-2 rounded bg-transparentBlack text-white text-sm border border-white/30 hover:bg-black/60 transition-colors"
        aria-label="Back"
      >
        <FiArrowLeft size={16} />
        Back
      </button>

      {/* Conference title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 max-w-md px-4 text-center pointer-events-none">
        <h1 className="text-white font-semibold text-lg drop-shadow">
          {conference.name}
        </h1>
      </div>

      {/* Left arrow — visible when paused */}
      {hasMultiple && !isPlaying && (
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-4/5 px-3 flex items-center text-white hover:bg-white/10 rounded-r transition-colors"
          data-testid="btn-slider-left"
          aria-label="Previous slide"
        >
          <FiChevronLeft size={48} />
        </button>
      )}

      {/* Right arrow — visible when paused */}
      {hasMultiple && !isPlaying && (
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-4/5 px-3 flex items-center text-white hover:bg-white/10 rounded-l transition-colors"
          data-testid="btn-slider-right"
          aria-label="Next slide"
        >
          <FiChevronRight size={48} />
        </button>
      )}

      {/* Slide dot indicators */}
      {hasMultiple && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {imageUrls.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2.5 h-2.5 rounded-full border border-white/60 transition-colors ${
                i === currentIndex ? "bg-white" : "bg-transparent"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Register button */}
      <button className="absolute bottom-10 right-12 z-20 px-6 py-2.5 rounded bg-mainBlue text-white text-sm font-semibold hover:bg-darkerBlue transition-colors shadow-lg">
        Register
      </button>

      {/* Play / Pause timer button */}
      {hasMultiple && (
        <button
          onClick={togglePlay}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 rounded-full bg-transparentBlack text-white border border-white p-2.5 hover:bg-black/60 transition-colors"
          data-testid={isPlaying ? "timer-pause-button" : "timer-play-button"}
          aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} />}
        </button>
      )}
    </div>
  );
}
