/* eslint react-refresh/only-export-components: off */
import React, { createContext, useContext, useState, useEffect } from 'react';

const BrandingContext = createContext();

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(() => {
    const saved = localStorage.getItem('app_branding');
    return saved ? JSON.parse(saved) : {
      title: 'FINANCEIRO IGREJA',
      logo: 'https://images.unsplash.com/photo-1438210159951-dc7d883b28b2?w=100&h=100&fit=crop', // Default elegante
    };
  });

  useEffect(() => {
    localStorage.setItem('app_branding', JSON.stringify(branding));
    
    // Atualizar título e favicon
    if (branding.title) document.title = branding.title;
    
    if (branding.logo) {
      const links = document.querySelectorAll("link[rel*='icon']");
      if (links.length > 0) {
        links.forEach(link => link.href = branding.logo);
      } else {
        // Criar se não existir
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = branding.logo;
        document.getElementsByTagName('head')[0].appendChild(newLink);
      }
    }
  }, [branding]);

  const updateBranding = (newBranding) => {
    setBranding(prev => ({ ...prev, ...newBranding }));
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => useContext(BrandingContext);
