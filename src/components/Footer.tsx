
import React from 'react';
import { Home, Settings, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="glass-card rounded-xl p-6 mt-10 animate-fade-up" style={{ animationDelay: '800ms' }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-3">FinTrack</h4>
          <p className="text-sm text-gray-400">
            Your trusted partner in financial tracking and analysis.
          </p>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-3">Contact Us</h4>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-400">
              <Phone className="h-4 w-4 mr-2" />
              <span>+91 9773302910</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Mail className="h-4 w-4 mr-2" />
              <span>support@fintrack.com</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
              <Home className="h-4 w-4 mr-2" />
              <a href="/">Home</a>
            </div>
            <div className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
              <Settings className="h-4 w-4 mr-2" />
              <a href="/dashboard">Dashboard</a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-800 mt-6 pt-6 text-center text-xs text-gray-500">
        © 2025 FinTrack. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
