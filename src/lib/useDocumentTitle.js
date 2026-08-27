import { useEffect } from 'react';

// SPA sans SSR : ceci ne remplace pas un vrai <title> par route pour les
// robots qui n'exécutent pas JS, mais couvre les onglets navigateur, les
// favoris, et les robots qui exécutent le JS (dont Google).
export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} — G-Dept Pro` : 'G-Dept Pro';
    return () => { document.title = previous; };
  }, [title]);
}
