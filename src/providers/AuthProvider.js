"use client";

import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';

const AuthProvider = ({ children }) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const redirectUri = isProduction 
    ? "https:www.inboxrecap.com" 
    : "http://localhost:3000";

  return (
    <Auth0Provider
      domain="dev-ftmr2hfwyqzsehxk.us.auth0.com"
      clientId="rXWK9L5O3pNeFYogyOdsPvOFrn2x6jkI"
      authorizationParams={{ redirect_uri: redirectUri }}
    >
      {children}
    </Auth0Provider>
  );
};

export default AuthProvider;
