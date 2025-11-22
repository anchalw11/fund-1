import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface PlatformOption {
  id: 'mt5' | 'tradingview';
  name: string;
  description: string;
  additionalFee: number;
  note?: string;
}

interface PlatformSelectorProps {
  selectedPlatform: 'mt5' | 'tradingview';
  onPlatformChange: (platform: 'mt5' | 'tradingview') => void;
  accountSize: number;
  challengeType?: string;
}

export default function PlatformSelector({
  selectedPlatform,
  onPlatformChange,
  accountSize,
  challengeType
}: PlatformSelectorProps) {
  // TradingView is now free
  const tradingViewFee = 0;

  const platforms: PlatformOption[] = [
    {
      id: 'mt5',
      name: 'metatrader 5',
      description: 'Industry standard trading platform',
      additionalFee: 0
    },
    {
      id: 'tradingview',
      name: 'tradingview',
      description: 'Advanced charting & analysis',
      additionalFee: 0,
      note: 'this is with our whitelabel server'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">
          Select Trading Platform
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/20 via-cyan-500/50 to-transparent ml-4"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((platform) => {
          const isSelected = selectedPlatform === platform.id;

          return (
            <motion.button
              key={platform.id}
              type="button"
              onClick={() => onPlatformChange(platform.id)}
              className={`
                relative overflow-hidden rounded-xl p-6 text-left transition-all duration-300
                ${isSelected
                  ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400'
                  : 'bg-gray-800/50 border-2 border-gray-700 hover:border-gray-600'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                </motion.div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold
                    ${isSelected
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                    }
                  `}>
                    {platform.id === 'mt5' ? 'M5' : 'TV'}
                  </div>

                  <div className="flex-1">
                    <h4 className={`
                      text-lg font-semibold uppercase tracking-wider
                      ${isSelected ? 'text-cyan-300' : 'text-gray-300'}
                    `}>
                      {platform.name}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {platform.description}
                    </p>
                  </div>
                </div>

                {platform.note && (
                  <div className="pl-15">
                    <p className="text-xs text-gray-500 italic">
                      {platform.note}
                    </p>
                  </div>
                )}

                {platform.additionalFee > 0 && (
                  <div className="pl-15 pt-2 border-t border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Additional fee:</span>
                      <span className={`
                        text-lg font-bold
                        ${isSelected ? 'text-cyan-300' : 'text-gray-300'}
                      `}>
                        +${platform.additionalFee}
                      </span>
                    </div>
                  </div>
                )}

                {platform.id === 'mt5' && (
                  <div className="pl-15">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                      No additional fees
                    </span>
                  </div>
                )}
              </div>

              {isSelected && (
                <motion.div
                  className="absolute inset-0 -z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 animate-pulse"></div>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400 text-sm">i</span>
            </div>
          </div>
          <div className="text-sm text-gray-300">
            <p className="font-medium text-blue-300 mb-1">Platform Selection</p>
            <p className="text-gray-400">
              Your selected platform will be set up after payment confirmation.
              TradingView access includes our whitelabel server with advanced features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
