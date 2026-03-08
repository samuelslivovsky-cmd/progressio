"use client";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const PADDING = 12;
const MIN_WIDTH = 240;
const MAX_WIDTH = Math.min(320, typeof window !== "undefined" ? window.innerWidth - 24 : 320);

export const Tooltip = ({
  content,
  children,
  containerClassName,
}: {
  content: string | React.ReactNode;
  children: React.ReactNode;
  containerClassName?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mouse, setMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [height, setHeight] = useState(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [usePortal, setUsePortal] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUsePortal(typeof document !== "undefined");
  }, []);

  useEffect(() => {
    if (isVisible && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isVisible, content]);

  const calculatePosition = (mouseX: number, mouseY: number) => {
    if (!contentRef.current || !containerRef.current)
      return { x: PADDING, y: PADDING };

    const tooltip = contentRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const tooltipWidth = Math.min(MIN_WIDTH, viewportWidth - PADDING * 2, tooltip.offsetWidth || MIN_WIDTH);
    const tooltipHeight = tooltip.scrollHeight;

    // Vždy vľavo od trigera: pravý okraj tooltipu pri ľavom okraji ikony
    let absoluteX = containerRect.left + mouseX - tooltipWidth - PADDING;
    let absoluteY = containerRect.top + mouseY + PADDING;

    // Nepresahovať viewport
    if (absoluteX < PADDING) absoluteX = PADDING;
    if (absoluteX + tooltipWidth > viewportWidth - PADDING)
      absoluteX = viewportWidth - tooltipWidth - PADDING;

    if (absoluteY + tooltipHeight > viewportHeight - PADDING)
      absoluteY = viewportHeight - tooltipHeight - PADDING;
    if (absoluteY < PADDING) absoluteY = PADDING;

    return { x: absoluteX, y: absoluteY };
  };

  const updateMousePosition = (mouseX: number, mouseY: number) => {
    setMouse({ x: mouseX, y: mouseY });
    requestAnimationFrame(() => {
      const newPosition = calculatePosition(mouseX, mouseY);
      setPosition(newPosition);
    });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsVisible(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    updateMousePosition(mouseX, mouseY);
  };

  const handleMouseLeave = () => {
    setMouse({ x: 0, y: 0 });
    setPosition({ x: 0, y: 0 });
    setIsVisible(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isVisible) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    updateMousePosition(mouseX, mouseY);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = touch.clientX - rect.left;
    const mouseY = touch.clientY - rect.top;
    updateMousePosition(mouseX, mouseY);
    setIsVisible(true);
  };

  const handleTouchEnd = () => {
    // Delay hiding to allow for tap interaction
    setTimeout(() => {
      setIsVisible(false);
      setMouse({ x: 0, y: 0 });
      setPosition({ x: 0, y: 0 });
    }, 2000);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Toggle visibility on click for mobile devices
    if (window.matchMedia("(hover: none)").matches) {
      e.preventDefault();
      if (isVisible) {
        setIsVisible(false);
        setMouse({ x: 0, y: 0 });
        setPosition({ x: 0, y: 0 });
      } else {
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        updateMousePosition(mouseX, mouseY);
        setIsVisible(true);
      }
    }
  };

  // Recompute position when visible, height or mouse changes (viewport coords for portal)
  useEffect(() => {
    if (isVisible && contentRef.current && containerRef.current) {
      const newPosition = calculatePosition(mouse.x, mouse.y);
      setPosition(newPosition);
    }
  }, [isVisible, height, mouse.x, mouse.y]);

  const tooltipEl = isVisible && (
    <AnimatePresence>
      <motion.div
        key={String(isVisible)}
        initial={{ height: 0, opacity: 1 }}
        animate={{ height, opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
        className="pointer-events-none fixed z-[100] min-w-[15rem] max-w-[calc(100vw-24px)] overflow-visible rounded-md border border-white/10 bg-neutral-900 text-neutral-200 shadow-xl ring-1 ring-white/10"
        style={{
          top: position.y,
          left: position.x,
        }}
      >
        <div
          ref={contentRef}
          className="p-3 text-sm text-neutral-200"
        >
          {content}
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block", containerClassName)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {children}
      {usePortal && typeof document !== "undefined"
        ? createPortal(tooltipEl, document.body)
        : tooltipEl}
    </div>
  );
};
