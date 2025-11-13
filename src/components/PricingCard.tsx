import React from 'react';

interface PricingCardProps {
  tier: {
    id: string;
    account_size: number;
    regular_price: number;
    discount_price: number;
    phase_1_price?: number;
    phase_2_price?: number;
  };
  isSelected: boolean;
  onSelect: () => void;
  challengeCode: string;
}

const PricingCard: React.FC<PricingCardProps> = ({ tier, isSelected, onSelect, challengeCode }) => {
  return (
    <div
      onClick={onSelect}
      className={`glass-card p-6 cursor-pointer transition-all hover:scale-105 ${
        isSelected ? 'border-2 border-electric-blue' : ''
      }`}
    >
      <div className="text-center">
        <div className="text-3xl font-bold mb-2">
          ${(tier.account_size || 0).toLocaleString()}
        </div>

        {challengeCode === 'PAYG_2STEP' ? (
          <div className="space-y-1">
            <div className="text-sm text-gray-400">Phase 1: <span className="text-lg font-bold text-green-400">${tier.phase_1_price}</span></div>
            <div className="text-sm text-gray-400">Phase 2: <span className="text-lg font-bold text-green-400">${tier.phase_2_price}</span></div>
          </div>
        ) : (
          <div>
            <div className="text-3xl font-bold text-neon-green mb-1">
              ${tier.discount_price}
            </div>
            <div className="text-sm text-gray-500 line-through">
              ${tier.regular_price}
            </div>
            <div className="text-xs text-green-400 font-bold">
              50% OFF
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingCard;
