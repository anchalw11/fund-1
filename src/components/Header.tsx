import React from 'react';
import { PillBase } from './ui/3d-adaptive-navigation-bar';
import GradientText from './ui/GradientText';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4">
      {/* Logo positioned absolutely to extreme left */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
        <a href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-electric-blue via-cyber-purple to-neon-green rounded-xl flex items-center justify-center shadow-lg shadow-electric-blue/30">
            <span className="text-sm font-bold text-white">F8</span>
          </div>
          <div className="flex items-center">
            <span className="text-xl font-heading font-bold">
              <GradientText>Fund8r</GradientText>
            </span>
          </div>
        </a>
      </div>

      {/* Centered container for pill */}
      <div className="flex justify-center items-center h-16">
        <div className="relative">
          {/* Enhanced background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/25 via-cyber-purple/30 to-neon-green/25 rounded-full blur-xl scale-150 animate-pulse"></div>
          <PillBase />
        </div>
      </div>
    </header>
  );
}
