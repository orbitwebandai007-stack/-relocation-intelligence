import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, ArrowRight, Home, Check, Menu, X, ChevronDown, Compass } from 'lucide-react';
import { CITIES, STEPS } from '../data/relocationData';
import { CityKey, WorkplaceHub } from '../types';

interface HeaderProps {
  fromCity: string;
  city: CityKey;
  workplace: WorkplaceHub | null;
  currentStep: number;
  maxStep?: number;
  isLanding: boolean;
  onGoLanding: () => void;
  onGoStep?: (step: number) => void;
  onSelectCity?: (cityKey: CityKey) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  city,
  currentStep,
  maxStep = 0,
  isLanding,
  onGoLanding,
  onGoStep,
  onSelectCity,
  onReset,
}) => {
  const [activeNav, setActiveNav] = useState('Home');
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileStepPickerOpen, setIsMobileStepPickerOpen] = useState(false);

  // Navigation items matching the SaaS reference navbar
  const landingNavItems = [
    { name: 'Home', href: '#' },
    { name: 'The Trap', href: '#problem' },
    { name: 'The Engine', href: '#how-it-works' },
    { name: 'Corridors', href: '#neighbourhoods' },
    { name: 'BLR vs NCR', href: '#cities' },
    { name: 'Offer Audit', href: '#evaluation' },
  ];

  const scrollToSection = (href: string) => {
    if (href === '#' || href === '#top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      const headerOffset = 80;
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
      }, 70);
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
      }, 70);
    } else {
      scrollToSection(href);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-transparent border-transparent pointer-events-none transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 pointer-events-auto">
        {/* Left: Brand Identity */}
        <div
          onClick={() => {
            onGoLanding();
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0 bg-white/80 hover:bg-white backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#E5EAE5] shadow-xs transition-all"
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
              Relocation Intelligence
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-[#5F6A63] tracking-wider uppercase mt-0.5 hidden sm:block">
              PRECISION CITY MOVE ENGINE
            </span>
          </div>
        </div>

        {/* Center: Step Progress Capsule (Only when in Planner Recommendations Phase) */}
        {!isLanding && maxStep >= 1 ? (
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
          <div />
        )}

        {/* Right: Essential Controls Only */}
        <div className="flex items-center gap-2 shrink-0">
          {!isLanding ? (
            <>
              {/* Reset Plan */}
              <button
                onClick={onReset}
                type="button"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-[#5F6A63] hover:text-[#BE123C] bg-white/80 hover:bg-white backdrop-blur-md border border-[#E5EAE5] shadow-xs transition-colors"
                title="Reset plan to defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              {/* Back to Home / Landing */}
              <button
                onClick={onGoLanding}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold bg-white/90 hover:bg-white backdrop-blur-md border border-[#E5EAE5] text-[#18231E] shadow-xs transition-colors"
              >
                <Home className="w-3.5 h-3.5 text-[#176B50]" />
                <span>Overview</span>
              </button>
            </>
          ) : (
            <>
              {/* Landing Page Action: Resume if started, else Start */}
              {maxStep > 0 && (
                <button
                  type="button"
                  onClick={() => onGoStep?.(currentStep)}
                  className="hidden sm:inline-block px-4 py-2 rounded-full text-xs font-semibold text-[#18231E] bg-white/90 hover:bg-white backdrop-blur-md border border-[#E5EAE5] shadow-xs transition-all"
                >
                  Resume Plan
                </button>
              )}

              <button
                onClick={() => onGoStep?.(0)}
                type="button"
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-semibold text-white bg-[#176B50] hover:bg-[#125740] shadow-sm hover:shadow-md transition-all active:scale-95 duration-150"
              >
                <span>Start Planning</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Animated Dropdown Navigation Menu */}
      <AnimatePresence>
        {isLanding && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden border-b border-[#E5EAE5] bg-white/98 backdrop-blur-xl overflow-hidden px-4 py-5 shadow-lg space-y-3"
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
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
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
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#176B50] text-white font-semibold text-xs shadow-xs"
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
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] text-[#18231E] font-semibold text-xs"
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
