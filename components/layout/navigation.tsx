'use client'; 

import Link from 'next/link';
import { UserButton, useAuth, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Radar, Globe, BookHeadphones, LibrarySquare, FileText, Shield, Brain, Fingerprint, User } from 'lucide-react';
import { Noto_Serif } from 'next/font/google';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
                          <LibrarySquare className="h-5 w-5" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Browse Topics</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
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
                    }}
                  >
                    <UserButton.MenuItems>
                      <UserButton.Link
                        label="My Sessions"
                        href="/mine"
                        labelIcon={<BookHeadphones className="h-4 w-4" />}
                      />
                      <UserButton.Link
                        label="Learnings"
                        href="/learnings"
                        labelIcon={<Brain className="h-4 w-4" />}
                      />
                      <UserButton.Link
                        label="Personalization"
                        href="/personalization"
                        labelIcon={<Fingerprint className="h-4 w-4" />}
                      />
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
                  <div className="relative">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-full h-10 w-10 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                        >
                          <User className="h-5 w-5 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="w-48 bg-white/95 dark:bg-slate-800/95" 
                        sideOffset={8}
                        onCloseAutoFocus={(e) => e.preventDefault()}
                      >
                        <DropdownMenuItem>
                          <a href="/terms" className="flex items-center w-full">
                            <FileText className="h-4 w-4 mr-2" />
                            Terms
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <a href="/privacy" className="flex items-center w-full">
                            <Shield className="h-4 w-4 mr-2" />
                            Privacy
                          </a>
                        </DropdownMenuItem>
                        <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <SignInButton mode="modal">
                            <Button 
                              className="w-full bg-blue-500 hover:bg-blue-600 text-white" 
                              size="sm"
                            >
                              Sign In
                            </Button>
                          </SignInButton>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
