'use client'; 

import Link from 'next/link';
import { UserButton, useAuth, SignInButton, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Radar, Globe, BookHeadphones, BookOpen, FileText, Shield } from 'lucide-react';
import { Noto_Serif } from 'next/font/google';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const notoSerif = Noto_Serif({ 
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['300', '400']
});

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [isRadarSpinning, setIsRadarSpinning] = useState(false);

  const handleRadarClick = () => {
    setIsRadarSpinning(true);
    setTimeout(() => setIsRadarSpinning(false), 500);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="px-4 pt-4">
        <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-md">
          <div className="max-w-7xl mx-auto px-3">
            <div className="flex items-center justify-between h-12">
              <Link 
                href="/" 
                className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity group" 
                onClick={handleRadarClick}
              >
                <Radar className={`h-5 w-5 text-slate-300 mr-2 ${isRadarSpinning ? 'animate-spin' : ''}`} />
                <span className={`${notoSerif.className} text-slate-300 text-lg italic`}>
                  Sessional
                </span>
                <span className={`
                  ${notoSerif.className} 
                  text-slate-500 
                  text-sm 
                  italic 
                  ml-2 
                  mt-1 
                  hidden 
                  md:opacity-0 
                  md:block 
                  group-hover:opacity-100 
                  transition-opacity
                `}>
                  Share your story
                </span>
              </Link>
              
              <div className="flex items-center space-x-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/feed" className="rounded-full">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`rounded-full h-10 w-10 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 ${
                            pathname === '/feed' ? 'bg-slate-700' : ''
                          }`}
                        >
                          <Globe className="h-5 w-5" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Discover Sessions</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/topics" className="rounded-full">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`rounded-full h-10 w-10 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 ${
                            pathname === '/topics' ? 'bg-slate-700' : ''
                          }`}
                        >
                          <BookOpen className="h-5 w-5" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Browse Topics</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {isSignedIn && (
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href="/mine" className="rounded-full">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`rounded-full h-10 w-10 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 ${
                                pathname === '/mine' ? 'bg-slate-700' : ''
                              }`}
                            >
                              <BookHeadphones className="h-5 w-5" />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>My Sessions</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
                
                {isSignedIn ? (
                    <UserButton 
                      afterSignOutUrl="/" 
                      appearance={{
                        elements: {
                          userButtonAvatarBox: {
                            width: "32px",
                            height: "32px"
                          }
                        }
                      }}>
                      <UserButton.MenuItems>
                        <UserButton.Link
                          label="Terms"
                          href="/terms"
                          labelIcon={<FileText className="h-4 w-4" />}
                        />
                        <UserButton.Link
                          label="Privacy"
                          href="/privacy"
                          labelIcon={<Shield className="h-4 w-4" />}
                        />
                      </UserButton.MenuItems>
                    </UserButton>
                ) : (
                  <SignInButton mode="modal">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white" size="sm">
                      Sign In
                    </Button>
                  </SignInButton>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
