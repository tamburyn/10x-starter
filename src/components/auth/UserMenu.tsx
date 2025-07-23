import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import type { AuthUser } from '../../lib/auth';

interface UserMenuProps {
  user: AuthUser | null;
  onSignOut: () => Promise<{ success: boolean; error?: string }>;
  isLoading?: boolean;
}

export function UserMenu({ user, onSignOut, isLoading = false }: UserMenuProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    try {
      const result = await onSignOut();
      if (result.success) {
        // Redirect will happen automatically
        window.location.href = '/login';
      } else {
        console.error('Sign out error:', result.error);
        setIsSigningOut(false);
      }
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      setIsSigningOut(false);
    }
  }, [onSignOut, isSigningOut]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  const displayName = user.profile 
    ? `${user.profile.first_name} ${user.profile.last_name}`
    : user.email?.split('@')[0] || 'Użytkownik';

  const companyName = user.company?.name;

  return (
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <div className="text-sm font-medium text-gray-900">
          {displayName}
        </div>
        {companyName && (
          <div className="text-xs text-gray-500">
            {companyName}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* User Avatar/Initials */}
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
          {displayName.charAt(0).toUpperCase()}
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-gray-500 hover:text-gray-700"
          title="Wyloguj"
        >
          {isSigningOut ? (
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          )}
        </Button>
      </div>
    </div>
  );
} 