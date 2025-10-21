import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ===================== YOUR IMAGES ===================== */
// Memories page: use /public/photos/1..100 (you can switch to swetha too)
// Wish page: EXACTLY /public/swetha/1..38
const MEMORIES_BASES = Array.from({ length: 100 }, (_, i) => `/photos/${i + 1}`);
const WISH_BASES = Array.from({ length: 38 }, (_, i) => `/swetha/${i + 1}`);

/* ===================== FLOAT-DOWN EMOJIS ===================== */
const FLOATERS_DOWN = [
  "🖤","💚","❤️","💙","💜","💖","💘","💞",
  "🎈","🎈","🎈","🎈",
  "🦄","🦚","🧅",
  "🌹","🌷","🎇","🎆"
];

/* ===================== BG + TWINKLES ===================== */
function OnionBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-800 via-purple-900 to-indigo-950" />
      {[...Array(8)].map((_, i) => (
        <div key={i} className="absolute inset-0 flex items-center justify-center">
          <div
            className="rounded-full blur-2xl opacity-20"
            style={{
              width: `${36 + i * 12}vmin`,
              height: `${36 + i * 12}vmin`,
              background:
                "radial-gradient(circle, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 70%)",
            }}
          />
        </div>
      ))}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={`tw-${i}`}
          className="absolute text-white/40"
          style={{ top: `${Math.random() * 90 + 5}%`, left: `${Math.random() * 90 + 5}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
        >
          ✦
        </motion.div>
      ))}
    </div>
  );
}

/* ===================== SMART IMAGE (no/ext/.jpg/.png/.webp) ===================== */
function SmartImage({ base, className = "", style = {}, alt = "" }) {
  const candidates = [
    base, base + ".jpg", base + ".jpeg", base + ".png", base + ".webp",
    base + ".JPG", base + ".JPEG", base + ".PNG", base + ".WEBP",
  ];
  const [i, setI] = useState(0);
  const [src, setSrc] = useState(candidates[0]);
  useEffect(() => { setI(0); setSrc(candidates[0]); /* eslint-disable-next-line */ }, [base]);
  const onErr = () => setI((prev) => {
    const next = prev + 1;
    if (next < candidates.length) setSrc(candidates[next]);
    return next;
  });
  return <img src={src} onError={onErr} className={className} style={style} alt={alt} />;
}

/* ===================== GLOBAL FLOAT-DOWN FX ===================== */
function FloaterDown({ emoji }) {
  const left = `${Math.random() * 90 + 3}%`;
  const duration = 10 + Math.random() * 9;
  const rotate = Math.random() * 20 - 10;
  return (
    <motion.div
      className="pointer-events-none select-none fixed text-3xl md:text-4xl"
      style={{ left }}
      initial={{ y: "-15vh", opacity: 0, rotate }}
      animate={{ y: "115vh", opacity: [0, 1, 1, 0], rotate: rotate * -1 }}
      transition={{ duration, ease: "linear" }}
    >
      {emoji}
    </motion.div>
  );
}
function FloatDownField({ count = 28, active = true }) {
  const [seed, setSeed] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setSeed((s) => s + 1), 900);
    return () => clearInterval(id);
  }, [active]);
  if (!active) return null;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <FloaterDown
          key={`fd-${seed}-${i}`}
          emoji={FLOATERS_DOWN[Math.floor(Math.random() * FLOATERS_DOWN.length)]}
        />
      ))}
    </>
  );
}

/* ===================== FLOATING PHOTOS (falling) ===================== */
function FloatingPhotosDown({ bases = [], active = true, shape = "circle", count = 32, ghostRatio = 0.35 }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), 1800);
    return () => clearInterval(id);
  }, [active]);

  if (!active || bases.length === 0) return null;
  const n = Math.min(count, bases.length);
  const shuffled = [...bases].sort(() => Math.random() - 0.5).slice(0, n);

  return (
    <>
      {shuffled.map((base, i) => {
        const left = `${Math.random() * 90 + 2}%`;
        const size = 64 + Math.floor(Math.random() * 96);
        const dur = 16 + Math.random() * 10;
        const delay = Math.random() * 2.5;
        const rotate = Math.random() * 20 - 10;
        const radiusClass = shape === "circle" ? "rounded-full" : "rounded-2xl";
        const isGhost = Math.random() < ghostRatio;
        const ghostOpacity = isGhost ? 0.25 : 1;
        const ghostScale = isGhost ? 0.9 : 1;

        return (
          <motion.div
            key={`${tick}-${i}`}
            className={`pointer-events-none fixed shadow-lg ${radiusClass}`}
            style={{ left, width: size, height: size, overflow: "hidden", opacity: ghostOpacity }}
            initial={{ y: "-20vh", opacity: 0, rotate, scale: ghostScale }}
            animate={{ y: "115vh", opacity: [0, ghostOpacity, ghostOpacity, 0], rotate: rotate * -1 }}
            transition={{ duration: dur, delay, ease: "linear" }}
          >
            <SmartImage base={base} className="h-full w-full object-cover" />
          </motion.div>
        );
      })}
    </>
  );
}

/* ===================== SPOTIFY PLAYER (EMBED) ===================== */
/** We switch WHAT to play based on the current step.
 *  - Step 0 (Welcome): show the player but no autoplay until Start
 *  - Step 1 (Memories): play Link A (sa70…)
 *  - Step 2 (Wish):     play Link B (DOFf…) → then Link C (iovP…) → then back to Link B forever
 *
 * Notes:
 * • These are Spotify short links; they usually embed fine. If any browser blocks it,
 *   replace with the "Copy Embed" URL from Spotify (open.spotify.com/embed/…).
 */
const SPOTIFY_A = "https://spotify.link/sa70npO8DXb"; // Memories
const SPOTIFY_B = "https://spotify.link/DOFfVjU8DXb"; // Wish start & final loop
const SPOTIFY_C = "https://spotify.link/iovPUla9DXb"; // Wish middle

function SpotifyEmbed({ startNow = false, step = 0 }) {
  const [src, setSrc] = useState(SPOTIFY_A);
  // durations for Wish sequence (tweak if needed)
  const B_DURATION_MS = 90000; // 90s on B, then C…
  const C_DURATION_MS = 90000; // 90s on C, then back to B (stay)

  useEffect(() => {
    let t1 = null, t2 = null;
    if (step === 1) {
      setSrc(SPOTIFY_A);
    } else if (step === 2) {
      // B → C → B (stay)
      setSrc(SPOTIFY_B);
      t1 = setTimeout(() => setSrc(SPOTIFY_C), B_DURATION_MS);
      t2 = setTimeout(() => setSrc(SPOTIFY_B), B_DURATION_MS + C_DURATION_MS);
    } else {
      // welcome
      setSrc(SPOTIFY_A);
    }
    return () => { if (t1) clearTimeout(t1); if (t2) clearTimeout(t2); };
  }, [step]);

  // Autoplay hint: user must click Start first; we rely on Spotify widget controls thereafter.
  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-xl overflow-hidden shadow-lg bg-black/40 backdrop-blur">
      <iframe
        key={src + (startNow ? "-go" : "-idle")}
        src={src}
        width="320"
        height="80"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Spotify"
      ></iframe>
      <div className="text-[10px] px-2 py-1 text-white/70">
        If a track doesn’t start, press Play on the Spotify bar.
      </div>
    </div>
  );
}

/* ===================== MEMORIES (train + slideshow) ===================== */
function PhotoTrain({ bases = [] }) {
  const strip = (
    <div className="flex items-center gap-3">
      <div className="text-4xl mr-2">🦄🚂</div>
      {bases.slice(0, 40).map((b, i) => (
        <SmartImage key={i} base={b} className="h-16 w-16 object-cover rounded-xl shadow" />
      ))}
    </div>
  );
  return (
    <div className="overflow-hidden w-full">
      <motion.div
        className="inline-block"
        initial={{ x: "100%" }}
        animate={{ x: "-120%" }}
        transition={{ duration: Math.min(20, 6 + bases.length * 0.12), ease: "linear" }}
      >
        {strip}
      </motion.div>
    </div>
  );
}
// Portrait-friendly slideshow with blurred fill, 5s per photo
function MemoryPlayer({ bases = [], autoMs = 5000 }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (bases.length === 0) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % bases.length), autoMs);
    return () => clearInterval(id);
  }, [bases.length, autoMs]);
  const current = bases[idx];
  return (
    <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl mx-auto bg-black">
      <div className="absolute inset-0 scale-110 blur-xl opacity-30">
        <SmartImage base={current} className="h-full w-full object-cover" alt="background" />
      </div>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={current + idx}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 1.01 }}
          animate={{ opacity: 1, scale: [1, 1.04, 1] }}
          exit={{ opacity: 0, scale: 0.995 }}
          transition={{ duration: Math.min(2.2, autoMs / 2.4), ease: "easeInOut" }}
        >
          <SmartImage base={current} className="max-h-full max-w-full object-contain" alt="memory" />
        </motion.div>
      </AnimatePresence>
      <motion.div
        key={`kiss-${idx}`}
        className="absolute bottom-6 left-6 text-4xl"
        initial={{ scale: 0, rotate: -20, opacity: 0 }}
        animate={{ scale: [0, 1.1, 1], rotate: 0, opacity: [0, 1, 1] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        🦄💋
      </motion.div>
    </div>
  );
}

/* ===================== TIMER HOOK ===================== */
function useLiveSince(iso = "2002-10-21T08:55:00") {
  const [text, setText] = React.useState("0 days 00:00:00");
  React.useEffect(() => {
    const update = () => {
      const birth = new Date(iso);
      const now = new Date();
      let diff = Math.max(0, now - birth);
      const days = Math.floor(diff / (24 * 3600 * 1000));
      diff -= days * 24 * 3600 * 1000;
      const h = Math.floor(diff / (3600 * 1000));
      diff -= h * 3600 * 1000;
      const m = Math.floor(diff / (60 * 1000));
      diff -= m * 60 * 1000;
      const s = Math.floor(diff / 1000);
      setText(`${days} days ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [iso]);
  return text;
}

/* ===================== WISH PAGE (38 photos + timer + message) ===================== */
function WishPage({ bases = [] }) {
  const since = useLiveSince("2002-10-21T08:55:00");
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    if (bases.length === 0) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % bases.length), 5000);
    return () => clearInterval(id);
  }, [bases.length]);
  const current = bases[idx];

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative px-6">
      <FloatDownField count={32} active />
      <FloatingPhotosDown bases={bases} shape="circle" count={38} ghostRatio={0.3} />
      <div className="relative z-10 w-full max-w-4xl">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black/40 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <h2 className="text-2xl md:text-3xl font-extrabold">Hey Kundhani — Happy Birthday! 🎂</h2>
            <div className="text-right text-sm md:text-base text-white/90">
              <div className="font-semibold">Since Oct 21, 2002 • 8:55 AM</div>
              <div className="font-mono">{since}</div>
            </div>
          </div>
          <div className="relative mx-auto w-full aspect-[16/10]">
            <div className="absolute inset-0 scale-110 blur-xl opacity-30">
              <SmartImage base={current} className="h-full w-full object-cover" />
            </div>
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={`wish-${idx}`}
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, rotate: -2, scale: 0.98 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 2, scale: 0.98 }}
                transition={{ duration: 0.8 }}
              >
                <div className="p-2 bg-black/30 rounded-2xl">
                  <SmartImage base={current} className="max-h-[60vh] max-w-[90%] object-contain rounded-2xl" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="px-6 pb-6 mt-2">
            <div className="rounded-2xl bg-white/10 border border-white/15 p-4 leading-relaxed">
              <p>Happy birthday to you, <span className="font-semibold">Kundhani</span> 🎉</p>
              <p>Be happy — you were strong. I will be there for you. Hope you will like the gifts. You will achieve many heights; hereafter every success will come to your feet.</p>
              <p className="mt-2">Once again, happy birthday to you, <span className="font-semibold">Kundhani</span> 💖</p>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-xs opacity-80">
          (Add your 38 photos in <code>/public/swetha/1 … 38</code>.)
        </p>
      </div>
    </div>
  );
}

/* ===================== MAIN APP (Welcome → Memories → Wish) ===================== */
export default function App() {
  const [step, setStep] = useState(0);
  const [startMusic, setStartMusic] = useState(false);

  return (
    <div className="min-h-screen w-screen bg-black text-white relative overflow-hidden">
      <OnionBackground />
      <FloatDownField count={28} active />

      {/* Spotify (will change track per step) */}
      <SpotifyEmbed startNow={startMusic} step={step} />

      {(step === 1 || step === 2) && (
        <FloatingPhotosDown
          bases={step === 1 ? MEMORIES_BASES : WISH_BASES}
          shape={step === 2 ? "circle" : "rounded"}
          count={34}
          ghostRatio={0.35}
        />
      )}

      <AnimatePresence mode="wait">
        {/* 0) WELCOME */}
        {step === 0 && (
          <motion.div
            key="welcome"
            className="min-h-screen flex items-center justify-center relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center px-6 z-10">
              <motion.div
                className="text-7xl md:text-8xl drop-shadow"
                initial={{ y: 20, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                🦄
              </motion.div>
              <motion.h1
                className="mt-4 text-4xl md:text-6xl font-black"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Welcome, Swetha ✨
              </motion.h1>
              <motion.p
                className="mt-3 text-lg md:text-xl text-white/90"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.35 }}
              >
                This is your gift. Please click the Start button.
              </motion.p>
              <motion.button
                onClick={() => { setStep(1); setStartMusic(true); }}
                className="mt-8 inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-lg font-semibold bg-white/15 hover:bg-white/25 border border-white/20 shadow-lg backdrop-blur-md"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                🎁 Click to Begin
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* 1) MEMORIES */}
        {step === 1 && (
          <motion.div
            key="memories"
            className="min-h-screen flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center w-full max-w-6xl z-10">
              <motion.p className="text-xl opacity-90" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                🦄: I’m carrying your memories like a train… get ready!
              </motion.p>
              <div className="mt-6">
                <PhotoTrain bases={MEMORIES_BASES} />
              </div>
              <div className="mt-8">
                <MemoryPlayer bases={MEMORIES_BASES} autoMs={5000} />
              </div>
              <div className="mt-10">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 rounded-2xl px-7 py-3 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl"
                >
                  Continue →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2) WISH */}
        {step === 2 && (
          <motion.div
            key="wish"
            className="min-h-screen flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <WishPage bases={WISH_BASES} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="py-10 text-center text-xs opacity-70 z-10">
        Memories: <code>/public/photos/</code> • Wish: <code>/public/swetha/</code>
      </div>
    </div>
  );
}
