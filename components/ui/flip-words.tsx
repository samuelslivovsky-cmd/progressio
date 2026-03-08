"use client";
import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

// Chrome: filter (blur) causes text to disappear even on inner element — skip blur,
// use opacity + y only so words are always visible. Sizer + overlay keep layout stable.
export const FlipWords = ({
  words,
  duration = 3000,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) => {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const longestWord = words.reduce((a, w) => (w.length > a.length ? w : a), "");

  const startAnimation = useCallback(() => {
    const word = words[words.indexOf(currentWord) + 1] || words[0];
    setCurrentWord(word);
    setIsAnimating(true);
  }, [currentWord, words]);

  useEffect(() => {
    if (!isAnimating)
      setTimeout(() => {
        startAnimation();
      }, duration);
  }, [isAnimating, duration, startAnimation]);

  return (
    <span className="inline-block relative text-left align-baseline">
      {/* In-flow sizer: keeps width + height + baseline stable so "Platforma pre" doesn't move */}
      <span
        aria-hidden
        className={cn("invisible whitespace-nowrap pointer-events-none", className)}
      >
        {longestWord}
      </span>
      {/* Flip content overlaid so exit animation doesn't affect layout */}
      <span className="absolute left-0 top-0 w-full h-full overflow-visible">
        <AnimatePresence
          mode="wait"
          onExitComplete={() => setIsAnimating(false)}
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 10,
            }}
            exit={{
              opacity: 0,
              y: -24,
              position: "absolute",
              left: 0,
              top: 0,
              transition: { type: "tween", duration: 0.2, ease: "easeOut" },
            }}
            className={cn(
              "z-10 inline-block relative text-neutral-900 dark:text-neutral-100 px-2",
              className
            )}
            key={currentWord}
          >
            {currentWord.split(" ").map((word, wordIndex) => (
              <motion.span
                key={word + wordIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: wordIndex * 0.3,
                  duration: 0.3,
                }}
                className="inline-block whitespace-nowrap"
              >
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={word + letterIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: wordIndex * 0.3 + letterIndex * 0.05,
                      duration: 0.2,
                    }}
                    className="inline-block"
                  >
                    {letter}
                  </motion.span>
                ))}
                <span className="inline-block">&nbsp;</span>
              </motion.span>
            ))}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
};
