
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface EmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendEmail: () => Promise<void>;
}

const EmailDialog: React.FC<EmailDialogProps> = ({ open, onOpenChange, onSendEmail }) => {
  const [emailSending, setEmailSending] = useState(false);
  const { toast } = useToast();
  
  const sendEmailConfirm = async () => {
    setEmailSending(true);
    
    try {
      await onSendEmail();
      
      setEmailSending(false);
      onOpenChange(false);
      
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onClick={() => onOpenChange(false)}
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
  );
};

export default EmailDialog;
