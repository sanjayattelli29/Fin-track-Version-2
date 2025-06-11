
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { Save, Mail, Menu, ChartBar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer";

interface FinanceHeaderProps {
  username: string;
  currentAccount: string;
  profileImage?: string;
  onSendEmail?: () => void;
}

const FinanceHeader: React.FC<FinanceHeaderProps> = ({ 
  username, 
  currentAccount,
  profileImage,
  onSendEmail
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [emailOpen, setEmailOpen] = React.useState(false);
  const [emailSending, setEmailSending] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
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
    
    if (onSendEmail) {
      setEmailOpen(true);
    } else {
      toast({
        title: "Email feature not available",
        description: "This feature is not available in the current view."
      });
    }
  };
  
  const sendEmailConfirm = async () => {
    setEmailSending(true);
    
    try {
      if (onSendEmail) {
        await onSendEmail();
      }
      
      setEmailSending(false);
      setEmailOpen(false);
      
      toast({
        title: "Email sent",
        description: "Financial report has been sent to attellisanjay29@gmail.com"
      });
    } catch (error) {
      setEmailSending(false);
      
      toast({
        title: "Failed to send email",
        description: "There was an error sending the email. Please try again.",
        variant: "destructive"
      });
    }
  };

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
    handleSendEmail();
  };
  
  const handleAnalyticsClick = () => {
    navigate('/analytics');
    setDrawerOpen(false);
  };
  
  const handleDashboardClick = () => {
    navigate('/');
    setDrawerOpen(false);
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
      
      {/* Email confirmation dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Financial Report</DialogTitle>
            <DialogDescription>
              You are about to send the financial report to attellisanjay29@gmail.com
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>The report will include data from all accounts and a summary of your financial status.</p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEmailOpen(false)}
              disabled={emailSending}
            >
              Cancel
            </Button>
            <Button 
              onClick={sendEmailConfirm}
              disabled={emailSending}
            >
              {emailSending ? "Sending..." : "Send Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FinanceHeader;
