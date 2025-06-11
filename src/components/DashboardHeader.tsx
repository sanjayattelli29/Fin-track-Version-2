
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { Save, Mail, ChartBar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import MobileActions from './MobileActions';
import EmailDialog from './EmailDialog';

interface DashboardHeaderProps {
  username: string;
  currentAccount: string;
  profileImage?: string;
  onSendEmail: () => Promise<void>;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  username, 
  currentAccount,
  profileImage,
  onSendEmail
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [emailOpen, setEmailOpen] = useState(false);
  const userInitials = username.split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSendEmail = async () => {
    if (emailOpen) {
      setEmailOpen(false);
      return;
    }
    
    setEmailOpen(true);
  };
  
  const handleAnalyticsClick = () => {
    navigate('/analytics');
  };
  
  const handleDashboardClick = () => {
    navigate('/');
  };

  return (
    <>
      <header className="w-full bg-[#0f172a] rounded-lg mb-4 animate-fade-in">
        {isMobile ? (
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">Financial Dashboard</h1>
                <div className="mt-1">
                  <p className="text-gray-200">Welcome Back, <span className="font-semibold">{username}</span></p>
                  <p className="text-gray-400 text-sm">This is your Financial Report.</p>
                </div>
              </div>
              
              <MobileActions 
                username={username}
                currentAccount={currentAccount}
                profileImage={profileImage}
                onSendEmail={handleSendEmail}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-row justify-between items-center py-4 px-6">
            {/* Left side - Title and welcome message */}
            <div>
              <h1 className="text-2xl font-bold text-white">Financial Dashboard</h1>
              <div className="mt-1">
                <p className="text-gray-200">Welcome Back, <span className="font-semibold">{username}</span></p>
                <p className="text-gray-400 text-sm">This is your Financial Report.</p>
              </div>
            </div>

            {/* Right side - Actions and account info */}
            <div className="flex items-center gap-4">
              {/* Dashboard button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-md border-[#1e293b] bg-[#1a1f2e] text-white hover:bg-[#2a3142]"
                onClick={handleDashboardClick}
              >
                <Save className="h-4 w-4 mr-2" />
                DASHBOARD
              </Button>
              
              {/* Analytics button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-md border-[#1e293b] bg-[#1a1f2e] text-white hover:bg-[#2a3142]"
                onClick={handleAnalyticsClick}
              >
                <ChartBar className="h-4 w-4 mr-2" />
                ANALYTICS
              </Button>

              {/* Save button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-md border-[#1e293b] bg-[#1a1f2e] text-white hover:bg-[#2a3142]"
              >
                <Save className="h-4 w-4 mr-2" />
                SAVE
              </Button>

              {/* Send Email button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSendEmail}
                className="rounded-md border-[#1e293b] bg-[#1a1f2e] text-white hover:bg-[#2a3142]"
              >
                <Mail className="h-4 w-4 mr-2" />
                SEND EMAIL
              </Button>

              {/* Current account and avatar */}
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-300">
                  Current Account: <span className="text-blue-400">{currentAccount}</span>
                </div>
                <Avatar 
                  className="h-10 w-10 border-2 border-blue-400 cursor-pointer" 
                  onClick={handleProfileClick}
                >
                  <AvatarImage src={profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${username}`} />
                  <AvatarFallback className="bg-orange-500 text-white">{userInitials}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        )}
      </header>
      
      <EmailDialog 
        open={emailOpen} 
        onOpenChange={setEmailOpen} 
        onSendEmail={onSendEmail}
      />
    </>
  );
};

export default DashboardHeader;
