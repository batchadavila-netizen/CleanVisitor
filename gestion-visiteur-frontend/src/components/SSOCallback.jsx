import React, { useEffect, useRef } from 'react';
import { useUser, AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

function SSOSyncHandler() {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const hasSynced = useRef(false);

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && isSignedIn && user && !hasSynced.current) {
        hasSynced.current = true;

        try {
          const payload = {
            email: user.primaryEmailAddress?.emailAddress,
            nom: user.lastName || user.firstName || 'Visiteur',
            prenom: user.firstName || 'Google',
            telephone: user.primaryPhoneNumber?.phoneNumber || '+237600000000',
            role: 3
          };

          const response = await authService.syncClerkUser(payload);

          if (response) {
            const token = response.token || response.accessToken;
            const userId = response.userId || response.user?.id;

            if (token) localStorage.setItem('token', token);
            if (userId) localStorage.setItem('userId', userId);

            localStorage.setItem('userRole', 'Visiteur');
            localStorage.setItem('userName', `${payload.prenom} ${payload.nom}`);

            // 🟢 REDIRECTION DIRECTE SUR LE TABLEAU DE BORD VISITEUR
            navigate('/mon-espace', { replace: true });
          }
        } catch (error) {
          console.error("Erreur de synchronisation backend:", error);
          navigate('/login', { replace: true });
        }
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, user, navigate]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white font-bold">
      Redirection vers votre espace...
    </div>
  );
}

export function SSOCallback() {
  return (
    <>
      {/* 🟢 Force le composant natif Clerk à rediriger sur /mon-espace si la synchro est instantanée */}
      <AuthenticateWithRedirectCallback 
        signInFallbackRedirectUrl="/mon-espace"
        signUpFallbackRedirectUrl="/mon-espace"
      />
      <SSOSyncHandler />
    </>
  );
}