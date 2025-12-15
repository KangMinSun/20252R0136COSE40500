"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AIAvatarProps {
  size?: number;
  isThinking?: boolean;
  isSpeaking?: boolean;
  className?: string;
}

export function AIAvatar({
  size = 44,
  isThinking = false,
  isSpeaking = false,
  className,
}: AIAvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [eyeDirection, setEyeDirection] = useState<"center" | "left" | "right">("center");
  const [leftEyebrowOffset, setLeftEyebrowOffset] = useState(0);
  const [rightEyebrowOffset, setRightEyebrowOffset] = useState(0);
  const [mouthState, setMouthState] = useState<"neutral" | "open" | "smirk-left" | "smirk-right" | "frown">("neutral");
  const [logoOffset, setLogoOffset] = useState({ x: 0, y: 0, rotate: 0 });

  // Blink animation - random intervals
  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 120);
    };

    const scheduleNextBlink = () => {
      const delay = 2000 + Math.random() * 3000;
      return setTimeout(() => {
        blink();
        scheduleNextBlink();
      }, delay);
    };

    const timeout = scheduleNextBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Eye direction animation - random look around
  useEffect(() => {
    const changeDirection = () => {
      const directions: ("center" | "left" | "right")[] = ["center", "left", "right", "center", "center"];
      setEyeDirection(directions[Math.floor(Math.random() * directions.length)]);
    };

    const interval = setInterval(changeDirection, 1500 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  // Eyebrow animation - independent movement
  useEffect(() => {
    const animateEyebrows = () => {
      const offsets = [-1.5, -1, 0, 0, 0, 0.5, 1];
      setLeftEyebrowOffset(offsets[Math.floor(Math.random() * offsets.length)]);
      setTimeout(() => {
        setRightEyebrowOffset(offsets[Math.floor(Math.random() * offsets.length)]);
      }, 200);
    };

    const interval = setInterval(animateEyebrows, 1200 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, []);

  // Enhanced eyebrow animation when thinking
  useEffect(() => {
    if (!isThinking) return;

    const thinkingAnimation = () => {
      setLeftEyebrowOffset(-1.5);
      setRightEyebrowOffset(0.5);
      setTimeout(() => {
        setLeftEyebrowOffset(0.5);
        setRightEyebrowOffset(-1.5);
      }, 600);
    };

    const interval = setInterval(thinkingAnimation, 1200);
    thinkingAnimation();
    return () => clearInterval(interval);
  }, [isThinking]);

  // Mouth animation - various states
  useEffect(() => {
    if (isSpeaking) {
      const speakingStates: ("neutral" | "open" | "smirk-left" | "smirk-right")[] = ["open", "neutral", "open", "smirk-left", "open", "smirk-right"];
      let index = 0;
      const interval = setInterval(() => {
        setMouthState(speakingStates[index % speakingStates.length]);
        index++;
      }, 150);
      return () => clearInterval(interval);
    }

    // Idle mouth animation
    const idleStates: ("neutral" | "smirk-left" | "smirk-right" | "frown")[] = ["neutral", "neutral", "neutral", "smirk-left", "neutral", "smirk-right", "neutral", "frown"];
    const animateMouth = () => {
      setMouthState(idleStates[Math.floor(Math.random() * idleStates.length)]);
    };

    const interval = setInterval(animateMouth, 2000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Logo shape animation based on expression
  useEffect(() => {
    const animateLogo = () => {
      setLogoOffset({
        x: (Math.random() - 0.5) * 1,
        y: (Math.random() - 0.5) * 0.8,
        rotate: (Math.random() - 0.5) * 2,
      });
    };

    const interval = setInterval(animateLogo, 800 + Math.random() * 600);
    return () => clearInterval(interval);
  }, []);

  // Eye position based on direction
  const getEyeOffset = () => {
    switch (eyeDirection) {
      case "left": return -1.2;
      case "right": return 1.2;
      default: return 0;
    }
  };

  const eyeOffset = getEyeOffset();

  // Mouth path based on state
  const getMouthPath = () => {
    switch (mouthState) {
      case "open":
        return "M-2 1 Q0 3 2 1 Q0 2.5 -2 1";
      case "smirk-left":
        return "M-3 0.5 Q-1 1.5 2 0";
      case "smirk-right":
        return "M-2 0 Q1 1.5 3 0.5";
      case "frown":
        return "M-2 1.5 Q0 0.5 2 1.5";
      default:
        return "M-2 0.5 Q0 1.5 2 0.5";
    }
  };

  return (
    <div
      className={cn("relative flex-shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* DocScanner Logo - 4 parallelograms with subtle movement */}
        <g
          transform={`translate(${6 + logoOffset.x}, ${4 + logoOffset.y}) scale(0.152) rotate(${logoOffset.rotate}, 105, 122)`}
          className="transition-transform duration-500 ease-out"
        >
          {/* Top left parallelogram - LEFT EYE area */}
          <path
            d="M43.9767 5.81418C44.7712 2.40898 47.807 0 51.3037 0H141.185C146.031 0 149.613 4.51423 148.512 9.23344L125.69 107.043C124.895 110.448 121.86 112.857 118.363 112.857H28.4815C23.6355 112.857 20.0533 108.343 21.1545 103.624L43.9767 5.81418Z"
            fill="black"
            style={{ transform: `translate(${leftEyebrowOffset * 0.5}px, ${leftEyebrowOffset * 0.3}px)` }}
            className="transition-transform duration-300"
          />
          {/* Top right small parallelogram - RIGHT EYEBROW area */}
          <path
            d="M146.242 54.6245C147.072 51.2653 150.086 48.9053 153.547 48.9053H201.247C206.133 48.9053 209.723 53.4901 208.551 58.2336L196.468 107.138C195.639 110.498 192.624 112.858 189.164 112.858H141.464C136.578 112.858 132.988 108.273 134.16 103.529L146.242 54.6245Z"
            fill="black"
            style={{ transform: `translate(${rightEyebrowOffset * 0.5}px, ${rightEyebrowOffset * 0.3}px)` }}
            className="transition-transform duration-300"
          />
          {/* Bottom left small parallelogram - MOUTH LEFT area */}
          <path
            d="M14.387 137.862C15.2169 134.503 18.231 132.143 21.6912 132.143H69.3911C74.2773 132.143 77.8673 136.727 76.6953 141.471L64.613 190.376C63.7831 193.735 60.769 196.095 57.3088 196.095H9.60886C4.72269 196.095 1.13272 191.51 2.30466 186.767L14.387 137.862Z"
            fill="black"
            style={{ transform: `translate(${mouthState === "smirk-left" ? -1 : mouthState === "smirk-right" ? 0.5 : 0}px, 0)` }}
            className="transition-transform duration-200"
          />
          {/* Bottom right parallelogram - MOUTH RIGHT area */}
          <path
            d="M85.1681 137.957C85.9626 134.552 88.9984 132.143 92.4951 132.143H182.377C187.223 132.143 190.805 136.657 189.704 141.376L166.881 239.186C166.087 242.591 163.051 245 159.554 245H69.6729C64.8269 245 61.2447 240.485 62.3459 235.766L85.1681 137.957Z"
            fill="black"
            style={{ transform: `translate(${mouthState === "smirk-right" ? 1 : mouthState === "smirk-left" ? -0.5 : 0}px, 0)` }}
            className="transition-transform duration-200"
          />
        </g>

        {/* Face features - positioned on logo shapes */}
        {/* Left eye - on top left parallelogram */}
        <g transform="translate(14, 12)">
          {/* Left eyebrow */}
          <path
            d={`M-2 ${-2 + leftEyebrowOffset} Q1 ${-3.5 + leftEyebrowOffset} 4 ${-2 + leftEyebrowOffset * 0.5}`}
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-300"
          />
          {/* Left eye */}
          {isBlinking ? (
            <path
              d="M-1 2 Q1.5 3 4 2"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <ellipse
              cx={1.5 + eyeOffset}
              cy="2"
              rx="2.8"
              ry="2.5"
              fill="white"
              className="transition-all duration-200"
            />
          )}
        </g>

        {/* Right eye - on top right parallelogram */}
        <g transform="translate(28, 14)">
          {/* Right eyebrow */}
          <path
            d={`M-2 ${-2 + rightEyebrowOffset * 0.5} Q1 ${-3.5 + rightEyebrowOffset} 4 ${-2 + rightEyebrowOffset}`}
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-300"
          />
          {/* Right eye */}
          {isBlinking ? (
            <path
              d="M-1 2 Q1.5 3 4 2"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <ellipse
              cx={1.5 + eyeOffset}
              cy="2"
              rx="2.8"
              ry="2.5"
              fill="white"
              className="transition-all duration-200"
            />
          )}
        </g>

        {/* Mouth - spanning bottom parallelograms */}
        <g transform="translate(22, 32)">
          <path
            d={getMouthPath()}
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill={mouthState === "open" ? "white" : "none"}
            className="transition-all duration-150"
          />
        </g>

        {/* Thinking indicator */}
        {isThinking && (
          <g className="animate-pulse">
            <circle cx="38" cy="6" r="2" fill="black" opacity="0.6" />
            <circle cx="42" cy="10" r="1.5" fill="black" opacity="0.4" />
          </g>
        )}
      </svg>
    </div>
  );
}

// Small avatar for messages
export function AIAvatarSmall({
  size = 28,
  isThinking = false,
  className,
}: {
  size?: number;
  isThinking?: boolean;
  className?: string;
}) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [eyeDirection, setEyeDirection] = useState<"center" | "left" | "right">("center");
  const [mouthState, setMouthState] = useState<"neutral" | "smirk">("neutral");

  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 120);
    };

    const scheduleNextBlink = () => {
      const delay = 2500 + Math.random() * 3000;
      return setTimeout(() => {
        blink();
        scheduleNextBlink();
      }, delay);
    };

    const timeout = scheduleNextBlink();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const changeDirection = () => {
      const directions: ("center" | "left" | "right")[] = ["center", "left", "right", "center"];
      setEyeDirection(directions[Math.floor(Math.random() * directions.length)]);
    };

    const interval = setInterval(changeDirection, 2000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const animateMouth = () => {
      setMouthState(Math.random() > 0.7 ? "smirk" : "neutral");
    };

    const interval = setInterval(animateMouth, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  const eyeOffset = eyeDirection === "left" ? -0.8 : eyeDirection === "right" ? 0.8 : 0;

  return (
    <div
      className={cn("relative flex-shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* DocScanner Logo - scaled down */}
        <g transform="translate(4, 3) scale(0.095)">
          <path
            d="M43.9767 5.81418C44.7712 2.40898 47.807 0 51.3037 0H141.185C146.031 0 149.613 4.51423 148.512 9.23344L125.69 107.043C124.895 110.448 121.86 112.857 118.363 112.857H28.4815C23.6355 112.857 20.0533 108.343 21.1545 103.624L43.9767 5.81418Z"
            fill="black"
          />
          <path
            d="M85.1681 137.957C85.9626 134.552 88.9984 132.143 92.4951 132.143H182.377C187.223 132.143 190.805 136.657 189.704 141.376L166.881 239.186C166.087 242.591 163.051 245 159.554 245H69.6729C64.8269 245 61.2447 240.485 62.3459 235.766L85.1681 137.957Z"
            fill="black"
          />
          <path
            d="M146.242 54.6245C147.072 51.2653 150.086 48.9053 153.547 48.9053H201.247C206.133 48.9053 209.723 53.4901 208.551 58.2336L196.468 107.138C195.639 110.498 192.624 112.858 189.164 112.858H141.464C136.578 112.858 132.988 108.273 134.16 103.529L146.242 54.6245Z"
            fill="black"
          />
          <path
            d="M14.387 137.862C15.2169 134.503 18.231 132.143 21.6912 132.143H69.3911C74.2773 132.143 77.8673 136.727 76.6953 141.471L64.613 190.376C63.7831 193.735 60.769 196.095 57.3088 196.095H9.60886C4.72269 196.095 1.13272 191.51 2.30466 186.767L14.387 137.862Z"
            fill="black"
          />
        </g>

        {/* Simple face */}
        {/* Left eye */}
        <g transform="translate(9, 8)">
          {isBlinking ? (
            <path d="M0 1 Q1.5 2 3 1" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" />
          ) : (
            <ellipse cx={1.5 + eyeOffset} cy="1" rx="1.8" ry="1.6" fill="white" className="transition-all duration-200" />
          )}
        </g>

        {/* Right eye */}
        <g transform="translate(17, 9)">
          {isBlinking ? (
            <path d="M0 1 Q1.5 2 3 1" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" />
          ) : (
            <ellipse cx={1.5 + eyeOffset} cy="1" rx="1.8" ry="1.6" fill="white" className="transition-all duration-200" />
          )}
        </g>

        {/* Mouth */}
        <g transform="translate(14, 20)">
          <path
            d={mouthState === "smirk" ? "M-2 0 Q0 1 2.5 -0.5" : "M-1.5 0 Q0 1 1.5 0"}
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-200"
          />
        </g>

        {/* Thinking dots */}
        {isThinking && (
          <circle cx="24" cy="4" r="1.5" fill="black" className="animate-pulse" />
        )}
      </svg>
    </div>
  );
}

export default AIAvatar;
