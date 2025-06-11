import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, BarChart2, Wallet, LineChart, DollarSign, Lock, X } from 'lucide-react';

const Index = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const CORRECT_PASSWORD = '652487';

  const handleGetStarted = () => {
    setShowPasswordModal(true);
    setPassword('');
    setPasswordError('');
  };

  const handlePasswordSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      setShowPasswordModal(false);
      // Simple redirect - you can replace this with your actual navigation
      window.location.href = '/dashboard';
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setPassword('');
    setPasswordError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 relative">
      <div className="relative overflow-hidden">
        {/* Header */}
        <header className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-blue-500 mr-2" />
              <span className="text-xl font-bold text-white">FinTrack</span>
            </div>
            <Button 
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Dashboard
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="relative pt-10 pb-20 sm:pt-16 lg:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Smart Financial Tracking
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-gray-300">
                Monitor your financial health with our intuitive tracking system. Take control of your expenses, investments, and earnings in one place.
              </p>
              <div className="mt-8">
                <Button 
                  onClick={handleGetStarted}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-lg text-lg transform hover:scale-105 transition-all duration-200"
                >
                  Get Started
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
                <div className="bg-blue-500/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <BarChart2 className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Track Expenses</h3>
                <p className="text-gray-400">
                  Monitor your daily and monthly expenses with detailed breakdowns and analysis.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
                <div className="bg-green-500/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Manage Investments</h3>
                <p className="text-gray-400">
                  Keep track of your investments and calculate your returns with ease.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
                <div className="bg-purple-500/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <LineChart className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Financial Insights</h3>
                <p className="text-gray-400">
                  Get powerful insights into your financial patterns and make informed decisions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gradient Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Lock className="h-6 w-6 text-blue-500 mr-2" />
                <h2 className="text-xl font-bold text-white">Enter Password</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-400">{passwordError}</p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handlePasswordSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Access Dashboard
              </Button>
              <Button
                onClick={handleCloseModal}
                className="bg-slate-600 hover:bg-slate-700 text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Wallet className="h-6 w-6 text-blue-500 mr-2" />
              <span className="text-lg font-bold text-white">FinTrack</span>
            </div>
            <p className="text-sm text-gray-400">© 2025 FinTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;