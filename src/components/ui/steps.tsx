import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepProps {
  title: string;
  description: string;
  status: 'upcoming' | 'current' | 'complete' | 'pending';
}

export const Step = ({ title, description, status }: StepProps) => {
  return (
    <div className="flex items-center">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
          status === 'complete'
            ? 'bg-primary text-primary-foreground'
            : status === 'current'
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-muted-foreground/30 text-muted-foreground'
        }`}
      >
        {status === 'complete' ? (
          <Check className="h-4 w-4" />
        ) : (
          <span className="text-sm font-medium">
            {status === 'current' ? '●' : '○'}
          </span>
        )}
      </div>
      <div className="ml-4 min-w-0 flex-1">
        <p
          className={`text-sm font-medium ${
            status === 'complete' || status === 'current'
              ? 'text-foreground'
              : 'text-muted-foreground'
          }`}
        >
          {title}
        </p>
        <p
          className={`text-sm ${
            status === 'complete' || status === 'current'
              ? 'text-muted-foreground'
              : 'text-muted-foreground/60'
          }`}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

interface StepsProps {
  steps: StepProps[];
  className?: string;
}

export const Steps = ({ steps, className }: StepsProps) => {
  return (
    <nav className={cn("flex flex-col space-y-4", className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-start">
          <Step {...step} />
          {index < steps.length - 1 && (
            <div className="ml-4 h-12 w-px bg-muted-foreground/30" />
          )}
        </div>
      ))}
    </nav>
  );
};
