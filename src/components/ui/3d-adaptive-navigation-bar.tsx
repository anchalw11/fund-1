// File: src/components/ui/3d-adaptive-navigation-bar.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

interface NavItem {
  label: string;
  href: string;
}

/**
 * 3D Adaptive Navigation Pill
 * Smart navigation with scroll detection and hover expansion
 */
export const PillBase: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [expanded, setExpanded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevSectionRef = useRef('home');

  const navItems: NavItem[] = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Challenges', href: '/challenge-types' },
    { label: 'FAQ', href: '/faq' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Login', href: '/login' },
    { label: 'Get Started', href: '/signup' },
  ];

  // Spring animations for smooth motion
  const pillWidth = useSpring(140, { stiffness: 220, damping: 25, mass: 1 });
  const pillShift = useSpring(0, { stiffness: 220, damping: 25, mass: 1 });

  // No scroll detection - purely click-based navigation

  // Handle hover expansion
  useEffect(() => {
    if (hovering) {
      setExpanded(true);
      pillWidth.set(720);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setExpanded(false);
        pillWidth.set(140);
      }, 600);
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [hovering, pillWidth]);

  const handleMouseEnter = () => {
    setHovering(true);
  };

  const handleMouseLeave = () => {
    setHovering(false);
  };

  const handleSectionClick = (href: string, index: number) => {
    // Trigger transition state
    setIsTransitioning(true);
    prevSectionRef.current = navItems[index].href;
    setActiveSection(navItems[index].href);

    // Collapse the pill after selection
    setHovering(false);

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400);

    // Handle navigation
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Handle routing navigation
      window.location.href = href;
    }
  };

  const activeItem = navItems.find(item => item.href === activeSection);

  return (
    <motion.nav
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-full"
      animate={expanded ? { scale: 1.02 } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        width: pillWidth,
        height: '56px',
        background: `
          linear-gradient(135deg,
            rgba(0, 0, 0, 0.02) 0%,
            rgba(0, 0, 0, 0.04) 15%,
            rgba(0, 0, 0, 0.06) 30%,
            rgba(0, 0, 0, 0.08) 45%,
            rgba(0, 0, 0, 0.10) 60%,
            rgba(0, 0, 0, 0.12) 75%,
            rgba(0, 0, 0, 0.14) 90%,
            rgba(0, 0, 0, 0.15) 100%
          )
        `,
        boxShadow: expanded
          ? `
            0 4px 8px rgba(0, 102, 255, 0.15),
            0 8px 16px rgba(123, 46, 254, 0.12),
            0 16px 32px rgba(0, 255, 136, 0.10),
            0 24px 48px rgba(0, 0, 0, 0.08),
            inset 0 3px 4px rgba(0, 102, 255, 0.4),
            inset 0 -4px 12px rgba(0, 0, 0, 0.15),
            inset 4px 4px 12px rgba(123, 46, 254, 0.2),
            inset -4px 4px 12px rgba(0, 255, 136, 0.1),
            inset 0 -2px 4px rgba(0, 102, 255, 0.1)
          `
          : isTransitioning
          ? `
            0 3px 6px rgba(0, 0, 0, 0.10),
            0 8px 16px rgba(0, 0, 0, 0.08),
            0 16px 32px rgba(0, 0, 0, 0.06),
            0 32px 64px rgba(0, 0, 0, 0.04),
            0 1px 2px rgba(0, 0, 0, 0.10),
            inset 0 2px 1px rgba(0, 102, 255, 0.25),
            inset 0 -2px 6px rgba(0, 0, 0, 0.08),
            inset 2px 2px 8px rgba(0, 0, 0, 0.06),
            inset -2px 2px 8px rgba(0, 0, 0, 0.05),
            inset 0 0 1px rgba(0, 0, 0, 0.12),
            inset 0 0 20px rgba(0, 102, 255, 0.05)
          `
          : `
            0 3px 6px rgba(0, 0, 0, 0.12),
            0 8px 16px rgba(0, 0, 0, 0.10),
            0 16px 32px rgba(0, 0, 0, 0.08),
            0 32px 64px rgba(0, 0, 0, 0.06),
            0 1px 2px rgba(0, 0, 0, 0.12),
            inset 0 2px 1px rgba(0, 102, 255, 0.2),
            inset 0 -2px 6px rgba(0, 0, 0, 0.10),
            inset 2px 2px 8px rgba(0, 0, 0, 0.08),
            inset -2px 2px 8px rgba(0, 0, 0, 0.07),
            inset 0 0 1px rgba(0, 0, 0, 0.15)
          `,
        x: pillShift,
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease-out',
      }}
    >
      {/* Primary top edge ridge - electric blue highlights */}
      <div
        className="absolute inset-x-0 top-0 rounded-t-full pointer-events-none"
        style={{
          height: '2px',
          background: `linear-gradient(90deg, rgba(0, 102, 255, 0) 0%, rgba(0, 102, 255, 0.95) 5%, rgba(0, 102, 255, 1) 15%, rgba(0, 102, 255, 1) 85%, rgba(0, 102, 255, 0.95) 95%, rgba(0, 102, 255, 0) 100%)`,
          filter: 'blur(0.3px)',
        }}
      />

      {/* Top hemisphere light catch */}
      <div
        className="absolute inset-x-0 top-0 rounded-full pointer-events-none"
        style={{
          height: '55%',
          background: `linear-gradient(180deg, rgba(0, 102, 255, 0.15) 0%, rgba(0, 102, 255, 0.10) 30%, rgba(0, 102, 255, 0.05) 60%, rgba(0, 102, 255, 0) 100%)`,
        }}
      />

      {/* Directional light - electric blue from top left */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `linear-gradient(135deg, rgba(0, 102, 255, 0.20) 0%, rgba(0, 102, 255, 0.10) 20%, rgba(0, 102, 255, 0.04) 40%, rgba(0, 102, 255, 0) 65%)`,
        }}
      />

      {/* Premium gloss reflection - main */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: expanded ? '18%' : '15%',
          top: '16%',
          width: expanded ? '140px' : '60px',
          height: '14px',
          background: `radial-gradient(ellipse at center, rgba(0, 102, 255, 0.70) 0%, rgba(0, 102, 255, 0.35) 40%, rgba(0, 102, 255, 0.10) 70%, rgba(0, 102, 255, 0) 100%)`,
          filter: 'blur(4px)',
          transform: 'rotate(-12deg)',
          transition: 'all 0.3s ease',
        }}
      />

      {/* Secondary gloss accent - only show when expanded */}
      {expanded && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            right: '22%',
            top: '20%',
            width: '80px',
            height: '10px',
            background: `radial-gradient(ellipse at center, rgba(123, 46, 254, 0.50) 0%, rgba(123, 46, 254, 0.15) 60%, rgba(123, 46, 254, 0) 100%)`,
            filter: 'blur(3px)',
            transform: 'rotate(8deg)',
          }}
        />
      )}

      {/* Left edge illumination - only show when expanded */}
      {expanded && (
        <div
          className="absolute inset-y-0 left-0 rounded-l-full pointer-events-none"
          style={{
            width: '35%',
            background: `linear-gradient(90deg, rgba(0, 102, 255, 0.10) 0%, rgba(0, 102, 255, 0.05) 40%, rgba(0, 102, 255, 0.01) 70%, rgba(0, 102, 255, 0) 100%)`,
          }}
        />
      )}

      {/* Right edge shadow - only show when expanded */}
      {expanded && (
        <div
          className="absolute inset-y-0 right-0 rounded-r-full pointer-events-none"
          style={{
            width: '35%',
            background: `linear-gradient(270deg, rgba(0, 0, 0, 0.10) 0%, rgba(0, 0, 0, 0.05) 40%, rgba(0, 0, 0, 0.02) 70%, rgba(0, 0, 0, 0) 100%)`,
          }}
        />
      )}

      {/* Bottom curvature - deep shadow */}
      <div
        className="absolute inset-x-0 bottom-0 rounded-b-full pointer-events-none"
        style={{
          height: '50%',
          background: `linear-gradient(0deg, rgba(0, 0, 0, 0.14) 0%, rgba(0, 0, 0, 0.08) 25%, rgba(0, 0, 0, 0.03) 50%, rgba(0, 0, 0, 0) 100%)`,
        }}
      />

      {/* Bottom edge contact shadow */}
      <div
        className="absolute inset-x-0 bottom-0 rounded-b-full pointer-events-none"
        style={{
          height: '20%',
          background: `linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0) 100%)`,
          filter: 'blur(2px)',
        }}
      />

      {/* Inner diffuse glow - electric blue */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 40px rgba(0, 102, 255, 0.12)',
          opacity: 0.7,
        }}
      />

      {/* Micro edge definition */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 0 0.5px rgba(0, 102, 255, 0.15)',
        }}
      />

      {/* Navigation items container */}
      <div
        ref={containerRef}
        className="relative z-10 h-full flex items-center justify-center px-6"
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro", Poppins, sans-serif',
        }}
      >
        {/* Collapsed state - show only active section with smooth text transitions */}
        {!expanded && (
          <div className="flex items-center relative">
            <AnimatePresence mode="wait">
              {activeItem && (
                <motion.span
                  key={activeItem.href}
                  initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                  transition={{
                    duration: 0.35,
                    ease: [0.4, 0.0, 0.2, 1]
                  }}
                  style={{
                    fontSize: '15.5px',
                    fontWeight: 680,
                    color: '#ffffff',
                    letterSpacing: '0.45px',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Poppins, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textShadow: `
                      0 1px 0 rgba(0, 102, 255, 0.35),
                      0 -1px 0 rgba(255, 255, 255, 0.8),
                      1px 1px 0 rgba(0, 0, 0, 0.18),
                      -1px 1px 0 rgba(0, 0, 0, 0.15)
                    `,
                  }}
                >
                  {activeItem.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Expanded state - show all sections with stagger */}
        {expanded && (
          <div className="flex items-center justify-evenly w-full">
            {navItems.map((item, index) => {
              const isActive = item.href === activeSection;

              return (
                <motion.button
                  key={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{
                    delay: index * 0.08,
                    duration: 0.25,
                    ease: 'easeOut'
                  }}
                  onClick={() => handleSectionClick(item.href, index)}
                  className="relative cursor-pointer transition-all duration-200"
                  style={{
                    fontSize: isActive ? '15.5px' : '15px',
                    fontWeight: isActive ? 680 : 510,
                    color: isActive ? '#ffffff' : '#e0e7ff',
                    textDecoration: 'none',
                    letterSpacing: '0.45px',
                    background: 'transparent',
                    border: 'none',
                    padding: '10px 16px',
                    outline: 'none',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Poppins, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    transform: isActive ? 'translateY(-1.5px)' : 'translateY(0)',
                    textShadow: isActive
                      ? `
                        0 1px 0 rgba(0, 102, 255, 0.35),
                        0 -1px 0 rgba(255, 255, 255, 0.8),
                        1px 1px 0 rgba(0, 0, 0, 0.18),
                        -1px 1px 0 rgba(0, 0, 0, 0.15)
                      `
                      : `
                        0 1px 0 rgba(0, 102, 255, 0.22),
                        0 -1px 0 rgba(255, 255, 255, 0.65),
                        1px 1px 0 rgba(0, 0, 0, 0.12),
                        -1px 1px 0 rgba(0, 0, 0, 0.10)
                      `,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#60a5fa';
                      e.currentTarget.style.transform = 'translateY(-0.5px)';
                      e.currentTarget.style.textShadow = `
                        0 1px 0 rgba(0, 102, 255, 0.4),
                        0 -1px 0 rgba(255, 255, 255, 0.9),
                        1px 1px 0 rgba(0, 0, 0, 0.2),
                        -1px 1px 0 rgba(0, 0, 0, 0.15)
                      `;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#e0e7ff';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.textShadow = `
                        0 1px 0 rgba(0, 102, 255, 0.22),
                        0 -1px 0 rgba(255, 255, 255, 0.65),
                        1px 1px 0 rgba(0, 0, 0, 0.12),
                        -1px 1px 0 rgba(0, 0, 0, 0.10)
                      `;
                    }
                  }}
                >
                  {item.label}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </motion.nav>
  );
};
