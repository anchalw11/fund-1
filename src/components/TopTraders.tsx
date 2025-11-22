import React from "react";
import { GradientCard } from "./ui/gradient-card";
import { Trophy, Star, Rocket } from "lucide-react";

export const TopTraders = () => {
  const traders = [
    {
      icon: <Trophy className="w-10 h-10 text-white" />,
      title: "🏆 Champion Trader",
      profit: "$147,250",
      subtitle: "Profit This Month",
      description: "Mastering prop trading since 2022",
    },
    {
      icon: <Star className="w-10 h-10 text-white" />,
      title: "⭐ Weekly Stars",
      profit: "$89,432",
      subtitle: "Highest Weekly Payout",
      description: "Consistent performance pays off",
    },
    {
      icon: <Rocket className="w-10 h-10 text-white" />,
      title: "🚀 Rising Stars",
      profit: "$45,678",
      subtitle: "First Month Success",
      description: "From demo to funded in 60 days",
    },
  ];

  return (
    <div className="bg-black text-white py-16">
      <div className="container mx-auto px-4">
        {/* Title and Subtitle */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">This Month's Top Traders</h2>
          <p className="text-xl text-gray-300">Real traders achieving real results every day</p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {traders.map((trader, index) => (
            <GradientCard
              key={index}
              icon={trader.icon}
              title={trader.title}
              profit={trader.profit}
              subtitle={trader.subtitle}
              description={trader.description}
            />
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-3xl font-bold mb-2">1,247</h3>
            <p className="text-gray-400">Traders Active This Month</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-2">3.5M</h3>
            <p className="text-gray-400">Total Funds Managed ($)</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-2">91%</h3>
            <p className="text-gray-400">Phase 1 Pass Rate</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-2">$1.2M</h3>
            <p className="text-gray-400">Total Paid This Month</p>
          </div>
        </div>
      </div>
    </div>
  );
};
