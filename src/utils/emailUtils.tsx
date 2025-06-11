
import { toast } from '@/components/ui/use-toast';

export const handleSendEmail = async () => {
  try {
    console.log("Simulating email sending...");
    // Simulate API call delay
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log("Email sending simulation complete");
        resolve();
      }, 1000);
    });
  } catch (error) {
    console.error("Email simulation error:", error);
    throw error;
  }
};

export const simulateEmailSending = async () => {
  try {
    toast({
      title: "Email preview",
      description: "This is a simulated email. In a real app, this would send a financial report."
    });
    
    return await handleSendEmail();
  } catch (error) {
    console.error("Error in email simulation:", error);
    toast({
      title: "Email Error",
      description: "Failed to send the email. Please try again.",
      variant: "destructive"
    });
    
    throw error;
  }
};
