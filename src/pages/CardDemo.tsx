"use client";

import { AnimatedCardStatusList, type Card } from "../components/ui/card-status-list";

const demoCards: Card[] = [
  { id: "1", title: "Import products from your store", status: "completed" },
  { id: "2", title: "Unique selling points", status: "completed" },
  { id: "3", title: "Primary customers", status: "completed" },
  { id: "4", title: "Common words & phrases", status: "updates-found" },
  { id: "5", title: "Company overview and offer details", status: "syncing" },
];

export default function CardDemo() {
  const handleSynchronize = (cardId: string) => {
    console.log("Synchronizing card:", cardId);
  };

  const handleAddCard = () => {
    console.log("Add new card clicked");
  };

  const handleBack = () => {
    console.log("Back button clicked");
  };

  return (
    <div className="min-h-screen w-full p-6 bg-background">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Animated Card Status List */}
        <AnimatedCardStatusList
          title="Fundamentals Demo"
          cards={demoCards}
          onSynchronize={handleSynchronize}
          onAddCard={handleAddCard}
          onBack={handleBack}
          className="max-w-xl mx-auto"
        />

        {/* Frequently Asked Questions */}
        <div className="w-full bg-card rounded-2xl p-8 border border-border/30">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Everything you need to know
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                <h3 className="font-semibold text-foreground mb-2">
                  What platforms can I use?
                </h3>
                <p className="text-muted-foreground text-sm">
                  We support MetaTrader 5 (MT5) across desktop, web, and mobile platforms.
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                <h3 className="font-semibold text-foreground mb-2">
                  Can I trade during news?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Yes, news trading is allowed. All strategies are permitted within our fair trading rules.
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                <h3 className="font-semibold text-foreground mb-2">
                  How fast are payouts?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Average payout time is 48 hours. We offer daily payouts with processing within 24 hours.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                <h3 className="font-semibold text-foreground mb-2">
                  Can I use Expert Advisors?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Yes, Expert Advisors (EAs), automated bots, and all indicators are allowed.
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                <h3 className="font-semibold text-foreground mb-2">
                  What if I fail the challenge?
                </h3>
                <p className="text-muted-foreground text-sm">
                  No worries! Reset for 50% off and try again. We want you to succeed.
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                <h3 className="font-semibold text-foreground mb-2">
                  Is Phase 2 really free?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Yes! Phase 2 is completely free with a 5% profit target and no time limits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
