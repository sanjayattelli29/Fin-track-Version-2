
import React, { useState } from 'react';
import { Calculator, Camera, FileText, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import CalculatorTool from './CalculatorTool';
import NotePadTool from './NotePadTool';
import { useToast } from '@/hooks/use-toast';

const FloatingTools = () => {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [showScreenshotDialog, setShowScreenshotDialog] = useState(false);
  const { toast } = useToast();

  const handleScreenshot = () => {
    // Close the screenshot dialog
    setShowScreenshotDialog(false);
    
    // Delay to allow the dialog to close
    setTimeout(() => {
      // Use the browser's screenshot API if available, otherwise fallback to canvas
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        // Modern browsers
        navigator.mediaDevices
          .getDisplayMedia({ video: true })
          .then(stream => {
            // Create a video element to capture the stream
            const video = document.createElement('video');
            video.srcObject = stream;
            video.onloadedmetadata = () => {
              video.play();
              
              // Create a canvas to draw the video frame
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              // Convert to data URL and download
              const dataUrl = canvas.toDataURL('image/png');
              const link = document.createElement('a');
              link.download = `screenshot-${new Date().toISOString().slice(0, 10)}.png`;
              link.href = dataUrl;
              link.click();
              
              // Stop all tracks
              stream.getTracks().forEach(track => track.stop());
            };
          })
          .catch(err => {
            console.error('Error taking screenshot:', err);
            toast({
              title: 'Screenshot Failed',
              description: 'Unable to capture screenshot. Please check permissions.',
              variant: 'destructive'
            });
          });
      } else {
        // Fallback for browsers that don't support getDisplayMedia
        toast({
          title: 'Screenshot Not Supported',
          description: 'Your browser does not support screen capture.',
          variant: 'destructive'
        });
      }
    }, 500);
  };

  return (
    <>
      {/* Main floating tools button - now on left side */}
      <div className="fixed left-6 bottom-6 z-40 flex flex-col gap-3 items-center">
        {/* Tool buttons (shown when tools are expanded) */}
        {activeSheet === 'tools' && (
          <div className="flex flex-col gap-3 mb-3 animate-fade-up">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-purple-500 hover:bg-purple-600 text-white"
              onClick={() => setShowScreenshotDialog(true)}
            >
              <Camera className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => setActiveSheet('calculator')}
            >
              <Calculator className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-green-500 hover:bg-green-600 text-white"
              onClick={() => setActiveSheet('notepad')}
            >
              <FileText className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        {/* Main toggle button */}
        <Button
          variant={activeSheet === 'tools' ? 'destructive' : 'default'}
          size="icon"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => setActiveSheet(activeSheet === 'tools' ? null : 'tools')}
        >
          {activeSheet === 'tools' ? (
            <X className="h-6 w-6" />
          ) : (
            <Settings className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Calculator Sheet */}
      <Sheet
        open={activeSheet === 'calculator'}
        onOpenChange={(open) => {
          if (!open) setActiveSheet(null);
        }}
      >
        <SheetContent className="w-80 sm:w-96 max-h-[500px] overflow-auto bg-[#0f172a] border-[#1e293b]">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-white">Calculator</SheetTitle>
            <SheetClose className="absolute right-4 top-4" />
          </SheetHeader>
          <CalculatorTool />
        </SheetContent>
      </Sheet>

      {/* NotePad Sheet */}
      <Sheet
        open={activeSheet === 'notepad'}
        onOpenChange={(open) => {
          if (!open) setActiveSheet(null);
        }}
      >
        <SheetContent className="w-80 sm:w-96 max-h-[500px] overflow-auto bg-[#0f172a] border-[#1e293b]">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-white">NotePad</SheetTitle>
            <SheetClose className="absolute right-4 top-4" />
          </SheetHeader>
          <NotePadTool />
        </SheetContent>
      </Sheet>

      {/* Screenshot Dialog */}
      <Dialog open={showScreenshotDialog} onOpenChange={setShowScreenshotDialog}>
        <DialogContent className="sm:max-w-md bg-[#0f172a] border-[#1e293b] text-white">
          <DialogHeader>
            <DialogTitle>Take a Screenshot</DialogTitle>
            <DialogClose className="absolute right-4 top-4" />
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              When you click "Capture Screen", you'll be asked to select which portion 
              of your screen to capture. The screenshot will be downloaded automatically.
            </p>
            <div className="flex justify-end">
              <Button onClick={handleScreenshot}>Capture Screen</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingTools;
