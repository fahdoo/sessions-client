import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { HelpCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TroubleshootingDialogProps {
  children?: React.ReactNode;
}

type Browser = 
  | 'chrome_desktop'
  | 'chrome_ios'
  | 'chrome_android'
  | 'safari_desktop'
  | 'safari_ios'
  | 'firefox'
  | 'edge'
  | 'other';

function detectBrowser(): Browser {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /iphone|ipad|ipod|android/.test(userAgent);
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  
  if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
    if (isIOS) return 'chrome_ios';
    if (isMobile) return 'chrome_android';
    return 'chrome_desktop';
  } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    if (isIOS) return 'safari_ios';
    return 'safari_desktop';
  } else if (userAgent.includes('firefox')) {
    return 'firefox';
  } else if (userAgent.includes('edg')) {
    return 'edge';
  }
  return 'other';
}

function getBrowserSpecificInstructions(browser: Browser): string {
  switch (browser) {
    case 'chrome_desktop':
      return 'Go to Chrome menu (⋮) > Settings > Privacy and security > Site Settings > View permissions and data > Search for this site > Microphone';
    case 'chrome_ios':
      return 'Tap the "AA" button in the address bar > Website Settings > Microphone > Allow';
    case 'chrome_android':
      return 'Tap the lock icon in the address bar > Site settings > Microphone > Allow';
    case 'safari_desktop':
      return 'Click Safari > Settings > Websites > Microphone > Find this site';
    case 'safari_ios':
      return 'Open Settings app > Safari > scroll down to this site > Microphone > Allow';
    case 'firefox':
      return 'Click the lock icon in the address bar > Permissions > Microphone > Allow';
    case 'edge':
      return 'Click menu (⋯) > Settings > Cookies and site permissions > Microphone > Manage permissions';
    default:
      return 'Check your browser settings to allow microphone access for this site';
  }
}

function getSystemInstructions(browser: Browser): string[] {
  if (browser === 'safari_ios' || browser === 'chrome_ios') {
    return [
      'Open iOS Settings app',
      'Scroll down to your browser (Safari/Chrome)',
      'Ensure microphone access is enabled for the browser',
      'You may need to restart your browser'
    ];
  }
  if (browser === 'chrome_android') {
    return [
      'Open Android Settings app',
      'Apps & notifications > Chrome > Permissions',
      'Ensure microphone access is enabled',
      'You may need to restart Chrome'
    ];
  }
  return [
    'Open System Settings/Preferences',
    'Check Privacy & Security settings',
    'Ensure microphone access is enabled for your browser',
    'You may need to restart your browser'
  ];
}

export function TroubleshootingDialog({ children }: TroubleshootingDialogProps) {
  const [browser, setBrowser] = useState<Browser>('other');

  useEffect(() => {
    setBrowser(detectBrowser());
  }, []);

  const systemInstructions = getSystemInstructions(browser);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            <HelpCircle className="h-4 w-4 mr-2" />
            Need help?
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Troubleshooting Guide</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Browser Settings</h3>
            <ul className="list-disc pl-4 text-sm text-slate-600 dark:text-slate-300">
              <li className="mb-2">
                <span className="font-medium">Enable microphone access:</span>
                <br />
                <span className="text-xs">{getBrowserSpecificInstructions(browser)}</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium">System Settings</h3>
            <ul className="list-disc pl-4 text-sm text-slate-600 dark:text-slate-300">
              {systemInstructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium">Other Issues</h3>
            <ul className="list-disc pl-4 text-sm text-slate-600 dark:text-slate-300">
              <li>Ensure no other apps are using the microphone</li>
              <li>Try selecting a different microphone if available</li>
              <li>Check your internet connection</li>
              <li>Try a different browser if problems persist</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 