import { useState, useEffect } from 'react';
import { useAuth, useUser } from "@clerk/nextjs";

export function useUserDataReady() {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isAuthLoaded && isUserLoaded) {
      if (isSignedIn && user) {
        // Check if essential user data is available
        const isDataComplete = Boolean(
          user.firstName &&
          user.lastName &&
          user.primaryEmailAddress
        );
        setIsReady(isDataComplete);
      } else {
        // If not signed in, we're ready to show the public view
        setIsReady(true);
      }
    }
  }, [isAuthLoaded, isUserLoaded, isSignedIn, user]);

  return { isReady, isAuthLoaded, isUserLoaded, isSignedIn, user };
}
