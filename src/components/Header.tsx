import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, ArrowRight, Home, Check, Menu, X } from 'lucide-react';
import { STEPS } from '../data/relocationData';
import { CityKey, WorkplaceHub } from '../types';

interface HeaderProps {
  fromCity: string;
  city: CityKey;
  workplace: WorkplaceHub | null;
  currentStep: number;
  maxStep?: number;
  isLanding: boolean;
  hasUnfinishedPlan?: boolean;
  onGoLanding: () => void;
  onGoStep?: (step: number) => void;
  onStartNewPlan?: () => void;
  onResumePlan?: () => void;
  onSelectCity?: (cityKey: CityKey) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  city,
  currentStep,
  maxStep = 0,
  isLanding,
  hasUnfinishedPlan = false,
  onGoLanding,
  onGoStep,
  onStartNewPlan,
  onResumePlan,
  onReset,
}) => {
  const [activeNav, setActiveNav] = useState('Home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items matching site sections
  const landingNavItems = [
    { name: 'Home', href: '#' },
    { name: 'The Trap', href: '#problem' },
    { name: 'The Engine', href: '#how-it-works' },
    { name: 'Corridors', href: '#neighbourhoods' },
    { name: 'BLR vs NCR', href: '#cities' },
    { name: 'Offer Audit', href: '#evaluation' },
  ];

  // Scroll spy to update activeNav dynamically when scrolling through sections
  useEffect(() => {
    if (!isLanding) return;

    const sections = landingNavItems
      .filter((item) => item.href.startsWith('#') && item.href !== '#')
      .map((item) => ({
        name: item.name,
        el: document.querySelector(item.href) as HTMLElement | null,
      }));

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      if (window.scrollY < 200) {
        setActiveNav('Home');
        return;
      }
      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec.el) {
          const top = sec.el.offsetTop;
          if (scrollPosition >= top) {
            setActiveNav(sec.name);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLanding]);

  const scrollToSection = (href: string) => {
    if (href === '#' || href === '#top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      const headerOffset = 85;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
    }
  };

  const handleNavClick = (e: React.MouseEvent, name: string, href: string) => {
    e.preventDefault();
    setActiveNav(name);
    if (!isLanding) {
      onGoLanding();
      setTimeout(() => {
        scrollToSection(href);
      }, 80);
    } else {
      scrollToSection(href);
    }
  };

  const handleMobileNavClick = (name: string, href: string) => {
    setActiveNav(name);
    setIsMobileMenuOpen(false);
    if (!isLanding) {
      onGoLanding();
      setTimeout(() => {
        scrollToSection(href);
      }, 80);
    } else {
      scrollToSection(href);
    }
  };

  return (
    <header
      className={`z-50 w-full transition-all duration-300 pointer-events-none ${
        isLanding
          ? 'sticky top-0 bg-transparent'
          : 'absolute top-0 left-0 right-0 bg-transparent border-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 pointer-events-auto">
        {/* Left: Brand Identity Floating Pill */}
        <div
          onClick={() => {
            onGoLanding();
            setIsMobileMenuOpen(false);
            if (isLanding) {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0 bg-white/90 hover:bg-white backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#E5EAE5] shadow-xs transition-all active:scale-95 duration-150"
          title="Worthwhile · Relocation Intelligence"
        >
          {/* 3-Node Brand Logo Mark */}
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:scale-105"
            >
              {/* Petal 1 */}
              <path
                d="M10 8C7.5 10.5 7.5 14.5 10 17L14 13C12.5 11.5 12.5 9.5 14 8C15.5 6.5 17.5 6.5 19 8L23 4C19 0 14 0 10 4Z"
                fill="#176B50"
              />
              {/* Petal 2 */}
              <path
                d="M26 14C28.5 16.5 28.5 20.5 26 23L22 19C23.5 17.5 23.5 15.5 22 14C20.5 12.5 18.5 12.5 17 14L13 10C17 6 22 6 26 10Z"
                fill="#18231E"
              />
              {/* Petal 3 */}
              <path
                d="M14 26C11.5 28.5 7.5 28.5 5 26L9 22C10.5 23.5 12.5 23.5 14 22C15.5 20.5 15.5 18.5 14 17L18 13C22 17 22 22 18 26Z"
                fill="#C8E6A0"
              />
              <circle cx="18" cy="18" r="2.5" fill="#176B50" />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="font-heading font-bold text-sm sm:text-base tracking-tight text-[#18231E] leading-none">
              Worthwhile
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-[#176B50] font-semibold tracking-wider uppercase mt-0.5 hidden sm:block">
              RELOCATION INTELLIGENCE
            </span>
          </div>
        </div>

        {/* Center: When on Landing, show horizontal nav links with smooth glide pill. When on Map, show step progress capsule */}
        {isLanding ? (
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/85 hover:bg-white backdrop-blur-md border border-[#E5EAE5] shadow-xs transition-all">
            {landingNavItems.slice(1).map((item) => {
              const isActive = activeNav === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={(e) => handleNavClick(e, item.name, item.href)}
                  className={`relative px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer active:scale-95 select-none ${
                    isActive
                      ? 'text-[#176B50]'
                      : 'text-[#5F6A63] hover:text-[#18231E]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="landing-active-nav-pill"
                      className="absolute inset-0 bg-[#E8F4EF] rounded-full -z-0 shadow-2xs"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.name}</span>
                </button>
              );
            })}
          </nav>
        ) : maxStep >= 1 ? (
          /* Step Progress Capsule for Planner Recommendations Stage */
          <nav className="hidden md:flex items-center">
            <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full border border-[#E5EAE5] shadow-xs flex items-center gap-1">
              {STEPS.map((stepName, index) => {
                const isCurrent = index === currentStep;
                const isCompleted = index < currentStep;
                const isAccessible = index <= maxStep;

                return (
                  <button
                    key={stepName}
                    type="button"
                    disabled={!isAccessible}
                    onClick={() => onGoStep?.(index)}
                    className={`relative flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isCurrent
                        ? 'text-white font-semibold'
                        : isCompleted
                        ? 'text-[#176B50] hover:bg-[#E8F4EF]'
                        : isAccessible
                        ? 'text-[#5F6A63] hover:text-[#18231E]'
                        : 'text-neutral-300 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {isCurrent && (
                      <motion.div
                        layoutId="active-step-pill"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        className="absolute inset-0 bg-[#176B50] rounded-full shadow-xs"
                      />
                    )}

                    <span className="relative z-10 flex items-center gap-1">
                      {isCompleted ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : (
                        <span className="font-mono text-[10px]">0{index + 1}</span>
                      )}
                      <span className="capitalize">{stepName.toLowerCase()}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        ) : (
          /* In onboarding or workplace selection phase: Center is clean and transparent */
          <div />
        )}

        {/* Right: Essential Controls & CTA */}
        <div className="flex items-center gap-2 shrink-0">
          {!isLanding ? (
            /* Map Screen: ONLY Essential Elements (Floating Reset and Overview buttons) */
            <>
              {/* Reset Plan */}
              <button
                onClick={onReset}
                type="button"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-[#5F6A63] hover:text-[#BE123C] bg-white/90 hover:bg-white backdrop-blur-md border border-[#E5EAE5] shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Reset plan to defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              {/* Back to Home / Landing */}
              <button
                onClick={onGoLanding}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold bg-white/90 hover:bg-white backdrop-blur-md border border-[#E5EAE5] text-[#18231E] hover:text-[#176B50] shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-[#176B50]" />
                <span>Overview</span>
              </button>
            </>
          ) : (
            /* Landing Page: Resume Plan + Start Planning Pill CTA */
            <>
              {hasUnfinishedPlan && (
                <button
                  type="button"
                  onClick={onResumePlan || (() => onGoStep?.(currentStep))}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-[#18231E] bg-white/90 hover:bg-white backdrop-blur-md border border-[#176B50]/30 hover:border-[#176B50] shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#176B50] animate-pulse" />
                  <span>Resume Plan</span>
                </button>
              )}

              {/* High Contrast Pill CTA matching site aesthetic */}
              <button
                onClick={onStartNewPlan || (() => onGoStep?.(0))}
                type="button"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-semibold text-white bg-[#18231E] hover:bg-[#176B50] shadow-xs hover:shadow-md transition-all active:scale-95 duration-150 cursor-pointer"
              >
                <span>Start Planning</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-full bg-white/90 hover:bg-white border border-[#E5EAE5] text-[#18231E] shadow-xs active:scale-95"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Animated Dropdown Navigation Menu (Landing page only) */}
      <AnimatePresence>
        {isLanding && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="md:hidden border-b border-[#E5EAE5] bg-white/98 backdrop-blur-xl overflow-hidden px-4 py-5 shadow-lg space-y-3 pointer-events-auto"
          >
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5F6A63] px-3">
              Explore Sections
            </div>
            <div className="grid grid-cols-1 gap-1">
              {landingNavItems.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleMobileNavClick(item.name, item.href)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors active:scale-98 ${
                    activeNav === item.name
                      ? 'bg-[#E8F4EF] text-[#176B50]'
                      : 'text-[#18231E] hover:bg-[#F8F9F7]'
                  }`}
                >
                  <span>{item.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#5F6A63]" />
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E5EAE5] flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onGoStep?.(0);
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#176B50] text-white font-semibold text-xs shadow-xs active:scale-98"
              >
                <span>Launch Relocation Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {maxStep > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onGoStep?.(currentStep);
                  }}
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] text-[#18231E] font-semibold text-xs active:scale-98"
                >
                  Resume Existing Plan
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
