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
    <header className="sticky top-0 z-50 w-full bg-[#F8F9F7]/90 backdrop-blur-md border-b border-[#E5EAE5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Brand Identity with Modern 3-Node Logo Mark */}
        <div
          onClick={() => {
            onGoLanding();
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0"
        >
          {/* Custom 3-Node Modern SaaS Logo Mark */}
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:scale-105"
            >
              {/* Petal 1 (Top Left) */}
              <path
                d="M10 8C7.5 10.5 7.5 14.5 10 17L14 13C12.5 11.5 12.5 9.5 14 8C15.5 6.5 17.5 6.5 19 8L23 4C19 0 14 0 10 4Z"
                fill="#176B50"
              />
              {/* Petal 2 (Right Node) */}
              <path
                d="M26 14C28.5 16.5 28.5 20.5 26 23L22 19C23.5 17.5 23.5 15.5 22 14C20.5 12.5 18.5 12.5 17 14L13 10C17 6 22 6 26 10Z"
                fill="#18231E"
              />
              {/* Petal 3 (Bottom Node) */}
              <path
                d="M14 26C11.5 28.5 7.5 28.5 5 26L9 22C10.5 23.5 12.5 23.5 14 22C15.5 20.5 15.5 18.5 14 17L18 13C22 17 22 22 18 26Z"
                fill="#C8E6A0"
              />
              {/* Center Core dot */}
              <circle cx="18" cy="18" r="2.5" fill="#176B50" />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="font-heading font-bold text-base sm:text-lg tracking-tight text-[#18231E] leading-none">
              Worthwhile
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono text-[#5F6A63] tracking-wider uppercase mt-1 hidden md:block">
              PRECISION CITY MOVE ENGINE
            </span>
          </div>
        </div>

        {/* Center: Desktop Floating Capsule Navigation (SaaS Reference Style) */}
        {isLanding ? (
          <nav className="hidden lg:flex items-center">
            <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-full border border-[#E5EAE5] shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center gap-1">
              {landingNavItems.map((item) => {
                const isActive = activeNav === item.name;
                const isHovered = hoveredNav === item.name;

                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.name, item.href)}
                    onMouseEnter={() => setHoveredNav(item.name)}
                    onMouseLeave={() => setHoveredNav(null)}
                    className="relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors select-none whitespace-nowrap cursor-pointer"
                  >
                    {/* Active/Hover Animated Capsule Background */}
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-pill"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="absolute inset-0 bg-[#F4F6F4] rounded-full shadow-xs border border-[#E5EAE5]"
                      />
                    )}
                    {!isActive && isHovered && (
                      <motion.div
                        layoutId="hover-nav-pill"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="absolute inset-0 bg-[#F8F9F7] rounded-full"
                      />
                    )}

                    <span
                      className={`relative z-10 font-medium ${
                        isActive
                          ? 'text-[#18231E] font-semibold'
                          : 'text-[#5F6A63] hover:text-[#18231E]'
                      }`}
                    >
                      {item.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </nav>
        ) : (
          /* Step Progress Capsule when in Planner Mode (Desktop) */
          <nav className="hidden md:flex items-center">
            <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-full border border-[#E5EAE5] shadow-xs flex items-center gap-1">
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
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
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
        )}

        {/* Mobile Step Status Pill (When in Planner mode on mobile screens) */}
        {!isLanding && (
          <div className="md:hidden relative">
            <button
              type="button"
              onClick={() => setIsMobileStepPickerOpen(!isMobileStepPickerOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5EAE5] text-[11px] font-semibold text-[#18231E] shadow-xs"
            >
              <span className="font-mono text-[#176B50]">0{currentStep + 1}/06</span>
              <span className="capitalize truncate max-w-[80px]">
                {STEPS[currentStep]}
              </span>
              <ChevronDown className="w-3 h-3 text-[#5F6A63]" />
            </button>

            {/* Mobile Step Picker Dropdown */}
            <AnimatePresence>
              {isMobileStepPickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute left-0 mt-2 w-48 bg-white rounded-2xl border border-[#E5EAE5] shadow-lg p-2 z-50 space-y-1"
                >
                  <div className="text-[10px] font-mono text-[#5F6A63] uppercase px-2 py-1 font-bold">
                    Jump to Step
                  </div>
                  {STEPS.map((s, idx) => {
                    const isAccessible = idx <= maxStep;
                    const isCurr = idx === currentStep;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={!isAccessible}
                        onClick={() => {
                          onGoStep?.(idx);
                          setIsMobileStepPickerOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left ${
                          isCurr
                            ? 'bg-[#176B50] text-white'
                            : isAccessible
                            ? 'hover:bg-[#F8F9F7] text-[#18231E]'
                            : 'opacity-40 cursor-not-allowed text-[#5F6A63]'
                        }`}
                      >
                        <span>0{idx + 1}. {s}</span>
                        {idx < currentStep && <Check className="w-3 h-3 text-[#176B50]" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Right: Actions & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {!isLanding ? (
            <>
              {/* Multi-city quick switch */}
              {onSelectCity && (
                <div className="relative inline-flex items-center">
                  <select
                    value={city}
                    onChange={(e) => onSelectCity(e.target.value as CityKey)}
                    aria-label="Select Destination City"
                    className="appearance-none bg-white hover:bg-[#F8F9F7] border border-[#E5EAE5] text-[#18231E] text-[11px] font-bold rounded-full pl-3 pr-6 py-1.5 shadow-xs focus:outline-none focus:ring-1 focus:ring-[#176B50] cursor-pointer transition-colors"
                  >
                    {Object.entries(CITIES).map(([key, data]) => (
                      <option key={key} value={key}>
                        {key.toUpperCase()} · {data.name.replace(' (NCR)', '')}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-[#5F6A63] absolute right-2 pointer-events-none" />
                </div>
              )}

              <button
                onClick={onReset}
                type="button"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-[#5F6A63] hover:text-[#18231E] hover:bg-neutral-100 transition-colors"
                title="Reset plan to defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                onClick={onGoLanding}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold bg-white border border-[#E5EAE5] text-[#18231E] hover:bg-[#F8F9F7] shadow-xs transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Overview</span>
              </button>
            </>
          ) : (
            <>
              {/* Secondary Ghost Button: Resume or Benchmarks */}
              {maxStep > 0 ? (
                <button
                  type="button"
                  onClick={() => onGoStep?.(currentStep)}
                  className="hidden sm:inline-block px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold text-[#18231E] hover:bg-white hover:border-[#E5EAE5] border border-transparent transition-all"
                >
                  Resume Plan
                </button>
              ) : (
                <a
                  href="#problem"
                  onClick={(e) => handleNavClick(e, 'The Trap', '#problem')}
                  className="hidden sm:inline-block px-3.5 sm:px-4 py-2 rounded-full text-xs font-medium text-[#5F6A63] hover:text-[#18231E] hover:bg-white/80 transition-all cursor-pointer"
                >
                  Benchmarks
                </a>
              )}

              {/* Primary High-Contrast CTA Button */}
              <button
                onClick={() => onGoStep?.(0)}
                type="button"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-semibold text-white bg-[#18231E] hover:bg-[#176B50] shadow-xs hover:shadow-md transition-all active:scale-95 duration-150"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Mobile Hamburger Toggle for Landing Page */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-9 h-9 rounded-full bg-white border border-[#E5EAE5] flex items-center justify-center text-[#18231E] hover:bg-[#F8F9F7] transition-colors shadow-xs"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
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
