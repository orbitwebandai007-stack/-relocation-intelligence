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
    <div className="bg-white border-b border-[#E5EAE5] overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="flex items-center space-x-1 sm:space-x-2 py-2.5 min-w-max"
          aria-label="Relocation Planner Progress"
        >
          {STEPS.map((stepName, index) => {
            const isCurrent = index === currentStep;
            const isCompleted = index < currentStep;
            const isAccessible = index <= maxStep;

            return (
              <button
                key={stepName}
                type="button"
                disabled={!isAccessible}
                onClick={() => onGoStep(index)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium tracking-tight transition-all duration-150 ${
                  isCurrent
                    ? 'bg-[#176B50] text-white shadow-xs'
                    : isCompleted
                    ? 'text-[#176B50] bg-[#E8F4EF] hover:bg-[#DDF0E7]'
                    : isAccessible
                    ? 'text-[#5F6A63] hover:text-[#18231E] hover:bg-neutral-100'
                    : 'text-neutral-300 cursor-not-allowed'
                }`}
              >
                <span
                  className={`w-4.5 h-4.5 rounded-md flex items-center justify-center text-[10px] font-mono font-medium transition-colors ${
                    isCurrent
                      ? 'bg-white/20 text-white'
                      : isCompleted
                      ? 'bg-[#176B50] text-white'
                      : 'bg-neutral-100 text-[#5F6A63]'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  ) : (
                    `0${index + 1}`
                  )}
                </span>
                <span className="capitalize">{stepName.toLowerCase()}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
