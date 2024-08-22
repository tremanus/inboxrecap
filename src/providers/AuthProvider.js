// src/providers/AuthProvider.js
"use client"; // Ensure this component is client-side

import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';

const AuthProvider = ({ children }) => {
  return (
    <Auth0Provider
      domain="dev-ftmr2hfwyqzsehxk.us.auth0.com"
      clientId="rXWK9L5O3pNeFYogyOdsPvOFrn2x6jkI"
      authorizationParams={{
        redirect_uri: typeof window !== 'undefined' ? window.location.origin : ''
      }}
    >
      {children}
    </Auth0Provider>
  );
};

export default AuthProvider;
