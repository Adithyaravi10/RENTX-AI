import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function StepWizard({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${
                index < currentStep
                  ? 'bg-brand-cyan border-brand-cyan text-black'
                  : index === currentStep
                    ? 'border-brand-cyan text-brand-cyan bg-brand-cyan/10'
                    : 'border-gray-600 text-gray-600'
              }`}
              animate={index === currentStep ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: index === currentStep ? Infinity : 0, duration: 2 }}
            >
              {index < currentStep ? <Check size={18} /> : index + 1}
            </motion.div>
            <span className={`text-xs mt-2 hidden sm:block ${index <= currentStep ? 'text-white' : 'text-gray-500'}`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 ${index < currentStep ? 'bg-brand-cyan' : 'bg-gray-700'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
