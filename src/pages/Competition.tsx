import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CompetitionPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">APEX Trader Challenge</h1>
        <p className="text-lg mb-8">Welcome to the ultimate trading competition. Prove your skills and get funded.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Prizes</h2>
            <p>Top traders get funded accounts up to $200,000 and a position on our trading floor.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Starting Date</h2>
            <p>The next cohort starts on the first Monday of next month.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Ending Date</h2>
            <p>The competition runs for 90 days from the start date.</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link to="/competition-rules">
            <Button variant="outline" className="mr-4">View Rules</Button>
          </Link>
          <Link to="/signup">
            <Button>Sign Up Now</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompetitionPage;
