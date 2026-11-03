import React from 'react';
import { STEPS } from '../data/relocationData';
import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: number;
  maxStep: number;
  onGoStep: (step: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  maxStep,
  onGoStep,
}) => {
  return (
    <div className="bg-[#FAFBF8] border-b border-[#E2E6DD] overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-2 sm:space-x-4 py-3 min-w-max" aria-label="Progress">
          {STEPS.map((stepName, index) => {
            const isCurrent = index === currentStep;
            const isCompleted = index < currentStep;
            const isAccessible = index <= maxStep;

            return (
              <button
                key={stepName}
                disabled={!isAccessible}
                onClick={() => onGoStep(index)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isCurrent
                    ? 'bg-[#21442E] text-white shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50/70 text-[#21442E] hover:bg-emerald-100/70'
                    : isAccessible
                    ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    : 'text-neutral-300 cursor-not-allowed'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isCurrent
                      ? 'bg-white/20 text-white'
                      : isCompleted
                      ? 'bg-[#21442E] text-white'
                      : 'bg-neutral-200/60 text-neutral-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : (
                    `0${index + 1}`
                  )}
                </span>
                <span className="uppercase">{stepName}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
