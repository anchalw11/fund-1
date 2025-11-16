import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { cn } from "../../lib/utils";
import { Clock, Plus, Copy, Zap } from "lucide-react";

/** I. CONFIGURATION */
const CARD_CONFIG = {
  width: 360,
  height: 540,
  glowColor: 'cyan',
  buttonText: "View Profile",
  animation: {
    statusInterval: 2500,
    fadeDuration: 500,
  },
}

const TIER_STYLES: Record<number, any> = {
  3: {
    name: 'Gold',
    glowClass: 'shadow-amber-400/50 border-amber-400 bg-amber-400',
  },
}

/** II. CUSTOM HOOK */
const useAnimatedStatus = (statuses: string[], interval: number) => {
  const [index, setIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const [visible, setVisible] = useState(statuses[0])

  useEffect(() => {
    if (statuses.length <= 1) return
    const timer = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        const next = (index + 1) % statuses.length
        setIndex(next)
        setVisible(statuses[next])
        setFading(false)
      }, CARD_CONFIG.animation.fadeDuration)
    }, interval)
    return () => clearInterval(timer)
  }, [index, statuses, interval])

  return (
    <span
      className={`
        transition-opacity
        duration-500
        ${fading ? 'opacity-0' : 'opacity-100'}
      `}
    >
      {visible}
    </span>
  )
}

/** III. UI PARTS */
const FloatingBadge: React.FC<{ text: string, className?: string }> = ({ text, className = '' }) => (
  <div
    className={`
      absolute
      text-amber-300/50
      font-bold
      text-6xl
      select-none
      ${className}
    `}
    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
  >
    {text}
  </div>
)

const ProfileImage: React.FC<{ imageUrl: string, username: string }> = ({ imageUrl, username }) => (
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px]">
    <div className="w-full h-full rounded-full bg-zinc-800 p-1 ring-2 ring-zinc-600">
      <img
        src={imageUrl}
        alt={username}
        className="w-full h-full rounded-full object-cover"
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          const target = e.target as HTMLImageElement
          target.onerror = null
          target.src = 'https://placehold.co/256x256/1f2937/ffffff?text=Error'
        }}
      />
    </div>
  </div>
)

interface OldProfileData {
  username: string;
  bio: string;
  status: string[];
  tier: number;
  imageUrl: string;
}


interface ComponentProps {
  title?: string;
  subtitle?: string;
  email?: string;
  avatarSrc?: string;
  statusText?: string;
  statusColor?: string;
  glowColor?: string;
  glowText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftButtonText?: string;
  rightButtonText?: string;
  onLeftButtonClick?: () => void;
  onRightButtonClick?: () => void;
  className?: string;
  data?: OldProfileData;
}

export default function Component({
  title = "Berat Berkay",
  subtitle = "Developer",
  email = "beratberkaygokdemir@gmail.com",
  avatarSrc = "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ2l0aHViL2ltZ18yc2pLdFl5STR0MkZMcUNKaVNMQVJXRmNBSXIifQ",
  statusText = "Available for work",
  statusColor = "bg-lime-500",
  glowColor,
  glowText = "Currently High on Creativity",
  leftIcon = <Plus className="h-4 w-4" />,
  rightIcon = <Copy className="h-4 w-4" />,
  leftButtonText,
  rightButtonText,
  onLeftButtonClick,
  onRightButtonClick,
  className,
  data,
}: ComponentProps) {
  // Handle backward compatibility
  const actualTitle = data ? data.username : title;
  const actualSubtitle = data ? data.bio : subtitle;
  const actualAvatarSrc = data ? data.imageUrl : avatarSrc;
  const actualStatusText = data ? data.status[0] : statusText;
  const [copied, setCopied] = useState(false);

  // Derive a local clock text once per minute
  const timeText = useMemo(() => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, "0");
    const hour12 = ((h + 11) % 12) + 1;
    const ampm = h >= 12 ? "PM" : "AM";
    return `${hour12}:${m}${ampm}`;
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  // If data prop is passed, render the old 3D profile card style
  if (data) {
    const { tier } = data;
    const tierStyle = { name: tier === 3 ? 'Gold' : '', glowClass: tier === 3 ? 'shadow-amber-400/50 border-amber-400 bg-amber-400' : '' };
    const [hover, setHover] = useState(false);
    const animatedStatus = useAnimatedStatus(data.status, CARD_CONFIG.animation.statusInterval);

    return (
      <div
        className="relative cursor-pointer transition-all duration-500"
        style={{
          width: CARD_CONFIG.width,
          height: CARD_CONFIG.height,
          transformStyle: 'preserve-3d',
          transform: hover
            ? 'rotateY(5deg) rotateX(-10deg) scale(1.05)'
            : 'scale(1)',
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <FloatingBadge text="dev" className="top-[-10px] right-[-30px]" />
        <FloatingBadge text="21" className="bottom-[-20px] left-[-20px] scale-75" />

        <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-zinc-700">
          <div className="p-6 pt-24 text-white text-center h-full flex flex-col justify-center">
            <h2 className="text-4xl font-bold">{actualTitle}</h2>
            <p className="text-lg text-zinc-300 mt-4 max-w-xs mx-auto">
              {actualSubtitle}
            </p>
            <div className="absolute bottom-5 right-6 text-2xl font-bold text-amber-400 tracking-widest">
              {animatedStatus}
            </div>
          </div>
        </div>

        <div
          className="absolute top-0 left-0 w-full h-[45%] transition-transform duration-500 ease-in-out"
          style={{
            transform: hover ? 'translateY(-70%)' : 'translateY(0%)',
          }}
        >
          <div className="absolute inset-0 bg-black/20 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg" />
          <div
            className={`absolute top-0 right-0 h-full w-1.5 rounded-r-2xl border-r-2 ${tierStyle.glowClass}`}
            style={{ boxShadow: `0 0 20px 3px var(--tw-shadow-color)` }}
          />
          <ProfileImage
            imageUrl={actualAvatarSrc}
            username={actualTitle}
          />
        </div>
      </div>
    );
  }

  // Default render (new style)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.05, y: -4 }}
      className={cn("relative w-xl cursor-pointer", className)}
    >

      <div className={cn("pointer-events-none absolute inset-x-0 -bottom-10 top-[72%] rounded-[28px] blur-0 z-0", glowColor || "bg-white/3")} />

      <div className="absolute inset-x-0 -bottom-10 mx-auto w-full z-0">
        <div className="flex items-center justify-center gap-2 bg-transparent py-3 text-center text-sm font-medium text-white/30">
          <Zap className="h-4 w-4" /> {glowText}
        </div>
      </div>

      <Card className="relative z-10 mx-auto w-full max-w-3xl overflow-visible rounded-[28px] bg-white/[0.02] backdrop-blur-xl text-white border-0 shadow-none">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between text-sm text-white">
            <div className="flex items-center gap-2">
              <span className={cn("inline-block h-2.5 w-2.5 rounded-full animate-pulse", statusColor)} />
              <span className="select-none">{actualStatusText}</span>
            </div>
            <div className="flex items-center gap-2 opacity-80">
              <Clock className="h-4 w-4" />
              <span className="tabular-nums">{timeText}</span>
            </div>
          </div>


          <div className="flex flex-wrap items-center gap-5">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-white/30">
              <img
                src={actualAvatarSrc}
                alt={`${actualTitle} avatar`}
                style={{width: "56px", height: "56px"}}
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-xl font-semibold tracking-tight text-white">
                {actualTitle}
              </h3>
              <p className="mt-0.5 text-sm text-white/80">{actualSubtitle}</p>
            </div>
          </div>


          {(leftButtonText || rightButtonText) && (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {leftButtonText && (
                <Button
                  variant="secondary"
                  onClick={onLeftButtonClick}
                  className="h-12 justify-start gap-3 rounded-2xl bg-white/10 text-white hover:bg-white/15"
                >
                  {leftIcon} {leftButtonText}
                </Button>
              )}

              {rightButtonText && (
                <Button
                  variant="secondary"
                  onClick={onRightButtonClick || handleCopy}
                  className="h-12 justify-start gap-3 rounded-2xl bg-white/10 text-white hover:bg-white/15"
                >
                  {rightIcon} {copied ? "Copied" : rightButtonText}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
