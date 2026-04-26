import React from 'react';
import { Button } from '../components/ui/Button';

interface OnboardingProps {
  onStart: () => void;
}

export function Onboarding({ onStart }: OnboardingProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'var(--color-dark)' }}
    >
      {/* Gradient orbs */}
      <div
        className="absolute top-1/4 left-1/2 w-[500px] h-[500px] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20"
        style={{ background: 'radial-gradient(circle, #5B3FE8, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #E8357A, transparent 70%)' }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm animate-slide-up">
        {/* Logo mark */}
        <div className="w-20 h-20 rounded-3xl bg-pactly-gradient flex items-center justify-center mb-6 shadow-2xl">
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
            <path d="M6 9h18l7 7v16H6V9z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
            <path d="M22 9v7h7" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
            <line x1="12" y1="21" x2="26" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="12" y1="27" x2="22" y2="27" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Brand */}
        <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tight">Pactly</h1>
        <p className="text-white/60 text-lg mb-10">Jouw contracten. Altijd in orde.</p>

        {/* Value props */}
        <div className="flex flex-col gap-3 mb-10 w-full text-left">
          {[
            { icon: '🔔', text: 'Nooit meer een opzegtermijn missen' },
            { icon: '📋', text: 'Al je contracten op één plek' },
            { icon: '💶', text: 'Inzicht in al je maandlasten' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3">
              <span className="text-xl">{icon}</span>
              <span className="text-white/80 text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>

        <Button size="lg" fullWidth onClick={onStart}>
          Begin gratis →
        </Button>
        <p className="text-white/30 text-xs mt-4">
          Al je contracten op één plek. Gratis. Altijd.
        </p>
      </div>
    </div>
  );
}
