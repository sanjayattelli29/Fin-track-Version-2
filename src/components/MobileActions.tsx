
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Save, Mail, ChartBar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer";

interface MobileActionsProps {
  username: string;
  currentAccount: string;
  profileImage?: string;
  onSendEmail: () => void;
}

const MobileActions: React.FC<MobileActionsProps> = ({
  username,
  currentAccount,
  profileImage,
  onSendEmail
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const userInitials = username.split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();

  // Mobile drawer actions
  const handleSaveAction = () => {
    toast({
      title: "Saved",
      description: "Your financial data has been saved."
    });
    setDrawerOpen(false);
  };

  const handleEmailAction = () => {
    setDrawerOpen(false);
    onSendEmail();
  };
  
  const handleAnalyticsClick = () => {
    navigate('/analytics');
    setDrawerOpen(false);
  };
  
  const handleDashboardClick = () => {
    navigate('/');
    setDrawerOpen(false);
  };
  
  const handleProfileClick = () => {
    navigate('/profile');
    setDrawerOpen(false);
  };

  return (
    <div className="flex justify-end mb-2">
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-md border-[#1e293b] bg-[#1a1f2e] text-white hover:bg-[#2a3142]">
            <Menu className="h-5 w-5" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="bg-[#0f172a] text-white border-t-[#1e293b]">
          <DrawerHeader>
            <DrawerTitle className="text-white">Dashboard Menu</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 py-2 space-y-3">
            <div className="text-sm text-gray-300 mb-4">
              Current Account: <span className="text-blue-400">{currentAccount}</span>
            </div>
            <Button 
              className="w-full justify-start bg-[#1a1f2e] hover:bg-[#2a3142] text-white"
              onClick={handleDashboardClick}
            >
              <Save className="h-5 w-5 mr-2" />
              Dashboard
            </Button>
            <Button 
              className="w-full justify-start bg-[#1a1f2e] hover:bg-[#2a3142] text-white"
              onClick={handleAnalyticsClick}
            >
              <ChartBar className="h-5 w-5 mr-2" />
              Analytics
            </Button>
            <Button 
              className="w-full justify-start bg-[#1a1f2e] hover:bg-[#2a3142] text-white"
              onClick={handleSaveAction}
            >
              <Save className="h-5 w-5 mr-2" />
              SAVE
            </Button>
            <Button 
              className="w-full justify-start bg-[#1a1f2e] hover:bg-[#2a3142] text-white"
              onClick={handleEmailAction}
            >
              <Mail className="h-5 w-5 mr-2" />
              SEND EMAIL
            </Button>
            <Button 
              className="w-full justify-start bg-[#1a1f2e] hover:bg-[#2a3142] text-white"
              onClick={handleProfileClick}
            >
              <Avatar 
                className="h-6 w-6 border border-blue-400 mr-2" 
              >
                <AvatarImage src={profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${username}`} />
                <AvatarFallback className="bg-orange-500 text-white text-xs">{userInitials}</AvatarFallback>
              </Avatar>
              Profile Settings
            </Button>
          </div>
          <DrawerFooter className="border-t border-[#1e293b] pt-4">
            <Button variant="outline" className="border-[#1e293b] text-gray-300" onClick={() => setDrawerOpen(false)}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default MobileActions;
