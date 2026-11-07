"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Wind,
  Palette,
  Grid2x2,
  Sparkles,
  Volume2,
  VolumeX,
  Heart,
  RotateCcw,
  Download,
  RefreshCw,
  Edit3,
  Check,
} from "lucide-react";
import type { SanitizedUser } from "@/types/wellness";
import { POSITIVE_AFFIRMATIONS } from "@/lib/wellness-content";
import { toIsoDate } from "@/lib/cycle-math";

interface MoodComfortZoneSectionProps {
  user: SanitizedUser;
  onRefresh: () => Promise<void>;
  onNotify: (msg: string, type?: "success" | "error") => void;
}

const BREATH_MODES = {
  "478": { name: "4-7-8 Calming Breath", inhale: 4, hold: 7, exhale: 8 },
  box: { name: "4-4-4-4 Box Harmony", inhale: 4, hold: 4, exhale: 4 },
  sigh: { name: "Gentle Petal Sigh", inhale: 4, hold: 2, exhale: 6 },
};

const COLORING_PALETTE = [
  { name: "Rose Quartz", hex: "#F9A8D4" },
  { name: "Blush Pink", hex: "#F472B6" },
  { name: "Lavender Mist", hex: "#D8B4FE" },
  { name: "Soft Violet", hex: "#A78BFA" },
  { name: "Peach Blossom", hex: "#FDBA74" },
  { name: "Apricot Cream", hex: "#FED7AA" },
  { name: "Chamomile Gold", hex: "#FDE68A" },
  { name: "Sage Leaf", hex: "#A7F3D0" },
  { name: "Sky Serenity", hex: "#BAE6FD" },
  { name: "Pure Pearl", hex: "#FFFDFB" },
];

const MEMORY_SYMBOLS = [
  { id: "lotus", label: "Lotus", emoji: "🪷" },
  { id: "moon", label: "Moon", emoji: "🌙" },
  { id: "tea", label: "Chamomile", emoji: "🍵" },
  { id: "sparkle", label: "Starlight", emoji: "✨" },
  { id: "lavender", label: "Lavender", emoji: "🪻" },
  { id: "heart", label: "Self-Love", emoji: "💗" },
];

interface MemoryCard {
  uid: number;
  symbolId: string;
  label: string;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function createShuffledDeck(): MemoryCard[] {
  const doubled = [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS];
  for (let i = doubled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
  }
  return doubled.map((item, idx) => ({
    uid: idx,
    symbolId: item.id,
    label: item.label,
    emoji: item.emoji,
    flipped: false,
    matched: false,
  }));
}

export default function MoodComfortZoneSection({
  user,
  onRefresh,
  onNotify,
}: MoodComfortZoneSectionProps) {
  // 1. Guided Breathing State
  const [breathMode, setBreathMode] = useState<keyof typeof BREATH_MODES>("478");
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathStage, setBreathStage] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathSecondsLeft, setBreathSecondsLeft] = useState(4);
  const [breathCyclesCompleted, setBreathCyclesCompleted] = useState(0);

  useEffect(() => {
    if (!isBreathing) return;
    const preset = BREATH_MODES[breathMode];
    let currentStage: "Inhale" | "Hold" | "Exhale" = "Inhale";
    let counter = preset.inhale;
    setBreathStage("Inhale");
    setBreathSecondsLeft(counter);

    const timer = setInterval(() => {
      counter -= 1;
      if (counter <= 0) {
        if (currentStage === "Inhale") {
          currentStage = "Hold";
          counter = preset.hold;
        } else if (currentStage === "Hold") {
          currentStage = "Exhale";
          counter = preset.exhale;
        } else {
          currentStage = "Inhale";
          counter = preset.inhale;
          setBreathCyclesCompleted((c) => c + 1);
        }
        setBreathStage(currentStage);
      }
      setBreathSecondsLeft(counter);
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreathing, breathMode]);

  // 2. Mandala Coloring Studio State
  const [selectedColor, setSelectedColor] = useState("#F9A8D4");
  const [petalColors, setPetalColors] = useState<Record<string, string>>({
    center: "#FDE68A",
    innerRing: "#FBCFE8",
    outerRing: "#F3E8FF",
    p0: "#FFFDFB",
    p1: "#FFFDFB",
    p2: "#FFFDFB",
    p3: "#FFFDFB",
    p4: "#FFFDFB",
    p5: "#FFFDFB",
    p6: "#FFFDFB",
    p7: "#FFFDFB",
    o0: "#FFFDFB",
    o1: "#FFFDFB",
    o2: "#FFFDFB",
    o3: "#FFFDFB",
    o4: "#FFFDFB",
    o5: "#FFFDFB",
    o6: "#FFFDFB",
    o7: "#FFFDFB",
  });
  const mandalaSvgRef = useRef<SVGSVGElement | null>(null);

  const paintRegion = (key: string) => {
    setPetalColors((prev) => ({ ...prev, [key]: selectedColor }));
  };

  const resetMandala = () => {
    setPetalColors((prev) => {
      const next: Record<string, string> = {};
      for (const k of Object.keys(prev)) next[k] = "#FFFDFB";
      return next;
    });
  };

  const downloadMandala = () => {
    if (!mandalaSvgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(mandalaSvgRef.current);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lunabloom-mandala.svg";
    link.click();
    URL.revokeObjectURL(url);
    onNotify("Downloaded your colored mandala keepsake!");
  };

  // 3. Mindful Memory Game State
  const [cards, setCards] = useState<MemoryCard[]>(() => createShuffledDeck());
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [lockBoard, setLockBoard] = useState(false);

  const handleCardClick = (index: number) => {
    if (lockBoard) return;
    if (cards[index].flipped || cards[index].matched) return;

    const nextCards = cards.map((c, i) =>
      i === index ? { ...c, flipped: true } : c
    );
    const nextFlipped = [...flippedIndices, index];
    setCards(nextCards);
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      setLockBoard(true);
      const [firstIdx, secondIdx] = nextFlipped;
      if (nextCards[firstIdx].symbolId === nextCards[secondIdx].symbolId) {
        setTimeout(() => {
          setCards((curr) =>
            curr.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, matched: true } : c
            )
          );
          setFlippedIndices([]);
          setLockBoard(false);
        }, 400);
      } else {
        setTimeout(() => {
          setCards((curr) =>
            curr.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, flipped: false } : c
            )
          );
          setFlippedIndices([]);
          setLockBoard(false);
        }, 750);
      }
    }
  };

  const allMatched = cards.every((c) => c.matched);

  const restartMemoryGame = () => {
    setCards(createShuffledDeck());
    setFlippedIndices([]);
    setMoves(0);
    setLockBoard(false);
  };

  // 4. Positive Affirmations Deck State
  const [affirmationIdx, setAffirmationIdx] = useState(0);
  const [savingAffirmation, setSavingAffirmation] = useState(false);

  const saveAffirmationToJournal = async () => {
    setSavingAffirmation(true);
    try {
      const todayStr = toIsoDate(new Date());
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logDate: todayStr,
          mood: "Grateful",
          moodScore: 5,
          energyLevel: 4,
          journalTitle: "Daily Positive Affirmation",
          journalEntry: POSITIVE_AFFIRMATIONS[affirmationIdx],
        }),
      });
      if (res.ok) {
        await onRefresh();
        onNotify("Affirmation saved to your private journal!");
      }
    } catch {
      onNotify("Could not save affirmation.", "error");
    } finally {
      setSavingAffirmation(false);
    }
  };

  // 5. Web Audio API Ambient Music / Soundscape Controls
  const [soundPlaying, setSoundPlaying] = useState(false);
  const [soundPreset, setSoundPreset] = useState<"bowl" | "rain" | "harmony">("bowl");
  const [volume, setVolume] = useState(0.35);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  const stopSoundscape = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
      masterGainRef.current = null;
    }
    setSoundPlaying(false);
  };

  const startSoundscape = (preset: "bowl" | "rain" | "harmony") => {
    stopSoundscape();
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) {
      onNotify("Web Audio is not supported in this browser.", "error");
      return;
    }

    const ctx = new AudioCtx();
    const masterGain = ctx.createGain();
    masterGain.gain.value = volume * 0.25;
    masterGain.connect(ctx.destination);

    if (preset === "rain") {
      // Soft pink-filtered rain noise
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.997 * b0 + white * 0.029;
        b1 = 0.985 * b1 + white * 0.032;
        b2 = 0.950 * b2 + white * 0.048;
        output[i] = (b0 + b1 + b2 + white * 0.02) * 0.5;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 650;

      whiteNoise.connect(filter);
      filter.connect(masterGain);
      whiteNoise.start(0);
    } else {
      // Warm harmonic sine chords (432Hz Singing Bowl or Pastel Spa Chord)
      const freqs =
        preset === "bowl" ? [216, 324, 432] : [261.63, 329.63, 392.0, 493.88];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = f;
        oscGain.gain.value = idx === 0 ? 0.45 : 0.25;
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
      });
    }

    audioCtxRef.current = ctx;
    masterGainRef.current = masterGain;
    setSoundPlaying(true);
  };

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume * 0.25;
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // 6. Virtual Wellness Pet State
  const [petBusy, setPetBusy] = useState(false);
  const [renamingPet, setRenamingPet] = useState(false);
  const [petNameDraft, setPetNameDraft] = useState(user.petName);
  const [petMessage, setPetMessage] = useState(
    `${user.petName} is curled up beside a warm cup of chamomile tea!`
  );

  const interactWithPet = async (
    action: "feed" | "cuddle" | "breathe" | "rename"
  ) => {
    setPetBusy(true);
    try {
      const res = await fetch("/api/pet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, petName: petNameDraft }),
      });
      const data = await res.json();
      if (res.ok) {
        await onRefresh();
        if (action === "feed") {
          setPetMessage(`${user.petName} happily nibbled a honey chamomile biscuit!`);
        } else if (action === "cuddle") {
          setPetMessage(`${user.petName} purrs softly and sends you warm rose-quartz calm.`);
        } else if (action === "breathe") {
          setPetMessage(`${user.petName} took a deep calming breath right alongside you.`);
        } else if (action === "rename") {
          setRenamingPet(false);
          setPetMessage(`Your companion is now named ${petNameDraft}!`);
        }
      } else {
        onNotify(data.error || "Could not interact with pet.", "error");
      }
    } catch {
      onNotify("Network error.", "error");
    } finally {
      setPetBusy(false);
    }
  };

  const orbScale = !isBreathing
    ? "scale-100"
    : breathStage === "Inhale"
    ? "scale-125"
    : breathStage === "Hold"
    ? "scale-125"
    : "scale-90";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#2E1A2B]">
          Mood Comfort Zone & Gentle Sanctuary
        </h1>
        <p className="text-sm text-[#5A4257]">
          Take a soothing break with guided breathing, mandala coloring, mindful games, ambient soundscapes, and {user.petName}.
        </p>
      </div>

      {/* Row 1: Guided Breathing + Virtual Wellness Pet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Breathing Exercises */}
        <div className="lg:col-span-6 wellness-card rounded-3xl p-6 flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-[#2E1A2B]">
                  Guided Breathing Orb
                </h2>
                <p className="text-xs text-[#6B5368]">
                  Calms the nervous system & eases cramps
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-800">
              {breathCyclesCompleted} breaths completed
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {(Object.keys(BREATH_MODES) as Array<keyof typeof BREATH_MODES>).map(
              (key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setIsBreathing(false);
                    setBreathMode(key);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                    breathMode === key
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-[#4A2E47] border-purple-200 hover:bg-purple-50"
                  }`}
                >
                  {BREATH_MODES[key].name}
                </button>
              )
            )}
          </div>

          {/* Animated Breath Orb */}
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <div
                className={`w-32 h-32 rounded-full bg-gradient-to-br from-pink-300 via-purple-300 to-orange-200 shadow-lg shadow-pink-200/70 transition-transform duration-1000 ease-in-out flex flex-col items-center justify-center text-center ${orbScale}`}
              >
                <span className="font-display text-lg font-bold text-[#2E1A2B]">
                  {isBreathing ? breathStage : "Ready"}
                </span>
                <span className="text-xs font-semibold text-[#4A2E47]">
                  {isBreathing ? `${breathSecondsLeft}s` : "Tap Start"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsBreathing((v) => !v)}
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold shadow-sm hover:opacity-95 transition cursor-pointer"
          >
            {isBreathing ? "Pause Breathing Exercise" : "Start Guided Breathing"}
          </button>
        </div>

        {/* Virtual Wellness Pet */}
        <div className="lg:col-span-6 wellness-card rounded-3xl p-6 flex flex-col justify-between space-y-4 bg-gradient-to-br from-white via-pink-50/60 to-orange-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              {renamingPet ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={petNameDraft}
                    onChange={(e) => setPetNameDraft(e.target.value)}
                    className="px-2.5 py-1 rounded-xl border border-pink-300 text-sm bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => interactWithPet("rename")}
                    className="p-1.5 rounded-xl bg-pink-500 text-white cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-semibold text-[#2E1A2B]">
                    {user.petName}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setPetNameDraft(user.petName);
                      setRenamingPet(true);
                    }}
                    title="Rename companion"
                    className="text-pink-500 hover:text-pink-700 p-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-100 text-orange-800">
              {user.petStage}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <img
              src="/images/luna-pet.png"
              alt={user.petName}
              className="w-32 h-32 rounded-3xl object-cover border-2 border-pink-200 shadow-md animate-float-slow shrink-0"
            />
            <div className="w-full space-y-3">
              <p className="text-xs text-[#4A2E47] bg-white/80 p-3 rounded-2xl border border-pink-100">
                “{petMessage}”
              </p>
              <div>
                <div className="flex justify-between text-xs font-semibold text-pink-900 mb-1">
                  <span>Happiness</span>
                  <span>{user.petHappiness}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-pink-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all"
                    style={{ width: `${user.petHappiness}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold text-purple-900 mb-1">
                  <span>Cozy Energy</span>
                  <span>{user.petEnergy}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-purple-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all"
                    style={{ width: `${user.petEnergy}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <button
              type="button"
              disabled={petBusy}
              onClick={() => interactWithPet("feed")}
              className="py-2.5 px-3 rounded-2xl bg-orange-100 hover:bg-orange-200/80 text-orange-900 text-xs font-semibold transition cursor-pointer"
            >
              🍪 Feed Treat
            </button>
            <button
              type="button"
              disabled={petBusy}
              onClick={() => interactWithPet("cuddle")}
              className="py-2.5 px-3 rounded-2xl bg-pink-100 hover:bg-pink-200/80 text-pink-900 text-xs font-semibold transition cursor-pointer"
            >
              🌸 Warm Cuddle
            </button>
            <button
              type="button"
              disabled={petBusy}
              onClick={() => interactWithPet("breathe")}
              className="py-2.5 px-3 rounded-2xl bg-purple-100 hover:bg-purple-200/80 text-purple-900 text-xs font-semibold transition cursor-pointer"
            >
              🌙 Breathe Together
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Mandala Coloring Studio + Mindful Memory Game */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Therapeutic Mandala Coloring */}
        <div className="lg:col-span-6 wellness-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-[#2E1A2B]">
                  Lotus Mandala Coloring
                </h2>
                <p className="text-xs text-[#6B5368]">
                  Pick a pastel swatch and tap petals to paint
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={resetMandala}
                title="Reset coloring"
                className="p-2 rounded-full bg-white border border-pink-200 text-[#4A2E47] hover:bg-pink-50 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={downloadMandala}
                title="Download artwork"
                className="p-2 rounded-full bg-white border border-pink-200 text-[#4A2E47] hover:bg-pink-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Swatch Picker */}
          <div className="flex flex-wrap gap-2">
            {COLORING_PALETTE.map((swatch) => (
              <button
                key={swatch.hex}
                type="button"
                title={swatch.name}
                onClick={() => setSelectedColor(swatch.hex)}
                className={`w-7 h-7 rounded-full border-2 transition cursor-pointer ${
                  selectedColor === swatch.hex
                    ? "border-[#2E1A2B] scale-110 shadow-xs"
                    : "border-white shadow-xs"
                }`}
                style={{ backgroundColor: swatch.hex }}
              />
            ))}
          </div>

          {/* Interactive SVG Mandala */}
          <div className="flex justify-center py-2">
            <svg
              ref={mandalaSvgRef}
              viewBox="0 0 260 260"
              className="w-60 h-60 cursor-pointer select-none"
            >
              <circle
                cx="130"
                cy="130"
                r="122"
                fill={petalColors.outerRing}
                stroke="#9D174D"
                strokeWidth="1.5"
                onClick={() => paintRegion("outerRing")}
              />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => (
                <g key={`outer-${deg}`} transform={`rotate(${deg} 130 130)`}>
                  <path
                    d="M130 16 C152 46, 152 78, 130 98 C108 78, 108 46, 130 16 Z"
                    fill={petalColors[`o${idx}`]}
                    stroke="#831843"
                    strokeWidth="1.5"
                    onClick={() => paintRegion(`o${idx}`)}
                  />
                </g>
              ))}
              <circle
                cx="130"
                cy="130"
                r="76"
                fill={petalColors.innerRing}
                stroke="#831843"
                strokeWidth="1.5"
                onClick={() => paintRegion("innerRing")}
              />
              {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map(
                (deg, idx) => (
                  <g key={`inner-${deg}`} transform={`rotate(${deg} 130 130)`}>
                    <path
                      d="M130 48 C146 70, 146 96, 130 112 C114 96, 114 70, 130 48 Z"
                      fill={petalColors[`p${idx}`]}
                      stroke="#701A75"
                      strokeWidth="1.5"
                      onClick={() => paintRegion(`p${idx}`)}
                    />
                  </g>
                )
              )}
              <circle
                cx="130"
                cy="130"
                r="26"
                fill={petalColors.center}
                stroke="#701A75"
                strokeWidth="1.5"
                onClick={() => paintRegion("center")}
              />
            </svg>
          </div>
        </div>

        {/* Mindful Botanical Memory Game */}
        <div className="lg:col-span-6 wellness-card rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Grid2x2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-[#2E1A2B]">
                  Mindful Botanical Memory
                </h2>
                <p className="text-xs text-[#6B5368]">
                  Gentle focus game • Moves: {moves}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={restartMemoryGame}
              className="px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold hover:bg-orange-100 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Shuffle
            </button>
          </div>

          {allMatched ? (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-100 via-purple-100 to-orange-100 text-center space-y-2">
              <p className="font-display text-xl font-bold text-[#2E1A2B]">
                Lovely Focus! All Pairs Matched
              </p>
              <p className="text-xs text-[#5A4257]">
                Completed in {moves} gentle moves. Ready for another round?
              </p>
              <button
                type="button"
                onClick={restartMemoryGame}
                className="px-4 py-2 rounded-full bg-pink-500 text-white text-xs font-semibold cursor-pointer"
              >
                Play Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2.5 py-2">
              {cards.map((card, idx) => {
                const show = card.flipped || card.matched;
                return (
                  <button
                    key={card.uid}
                    type="button"
                    onClick={() => handleCardClick(idx)}
                    className={`h-16 sm:h-20 rounded-2xl border flex flex-col items-center justify-center transition cursor-pointer ${
                      card.matched
                        ? "bg-pink-100/90 border-pink-300 text-pink-900"
                        : show
                        ? "bg-white border-purple-300 shadow-xs"
                        : "bg-gradient-to-br from-pink-200/80 to-purple-200/80 border-pink-200 hover:opacity-90"
                    }`}
                  >
                    {show ? (
                      <>
                        <span className="text-xl sm:text-2xl">{card.emoji}</span>
                        <span className="text-[10px] font-semibold text-[#5A4257] mt-0.5">
                          {card.label}
                        </span>
                      </>
                    ) : (
                      <Sparkles className="w-5 h-5 text-purple-600/70" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Positive Affirmations + Calming Soundscape Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Positive Affirmations */}
        <div className="lg:col-span-6 wellness-card rounded-3xl p-6 flex flex-col justify-between space-y-4 bg-gradient-to-r from-pink-50/90 via-white to-purple-50/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-pink-700 bg-pink-100 px-3 py-1 rounded-full">
              Positive Affirmations ({affirmationIdx + 1}/{POSITIVE_AFFIRMATIONS.length})
            </span>
            <Sparkles className="w-5 h-5 text-pink-500" />
          </div>

          <blockquote className="font-display text-xl md:text-2xl font-medium text-[#2E1A2B] leading-relaxed py-2">
            “{POSITIVE_AFFIRMATIONS[affirmationIdx]}”
          </blockquote>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() =>
                setAffirmationIdx((i) => (i + 1) % POSITIVE_AFFIRMATIONS.length)
              }
              className="px-4 py-2 rounded-full bg-white border border-pink-200 text-pink-900 text-xs font-semibold hover:bg-pink-50 cursor-pointer"
            >
              Next Affirmation
            </button>
            <button
              type="button"
              disabled={savingAffirmation}
              onClick={saveAffirmationToJournal}
              className="px-4 py-2 rounded-full bg-pink-500 text-white text-xs font-semibold hover:opacity-95 cursor-pointer"
            >
              {savingAffirmation ? "Saving..." : "Save to Today's Journal"}
            </button>
          </div>
        </div>

        {/* Calming Ambient Soundscape Controls */}
        <div className="lg:col-span-6 wellness-card rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                {soundPlaying ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-[#2E1A2B]">
                  Calming Soundscape Synth
                </h2>
                <p className="text-xs text-[#6B5368]">
                  Soothing Web Audio frequencies for rest & sleep
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-purple-700">
              {soundPlaying ? "Playing" : "Paused"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "bowl", label: "432Hz Singing Bowl" },
              { id: "rain", label: "Soft Pink Rain" },
              { id: "harmony", label: "Pastel Spa Chord" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  const nextPreset = item.id as "bowl" | "rain" | "harmony";
                  setSoundPreset(nextPreset);
                  if (soundPlaying) startSoundscape(nextPreset);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                  soundPreset === item.id
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-[#4A2E47] border-purple-200 hover:bg-purple-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#5A4257]">Volume</span>
            <input
              type="range"
              min={0.05}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 accent-purple-500 cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              soundPlaying ? stopSoundscape() : startSoundscape(soundPreset)
            }
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold shadow-sm hover:opacity-95 transition cursor-pointer"
          >
            {soundPlaying ? "Stop Calming Audio" : "Play Calming Soundscape"}
          </button>
        </div>
      </div>
    </div>
  );
}
