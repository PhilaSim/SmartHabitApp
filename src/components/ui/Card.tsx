import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn(
      'bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6',
      className
    )}>
      {children}
    </div>
  );
}