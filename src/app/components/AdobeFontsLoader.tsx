'use client';
import { useEffect } from 'react';

export default function AdobeFontsLoader() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://use.typekit.net/blm5pmr.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.Typekit) window.Typekit.load();
    };
    document.head.appendChild(script);

    document.documentElement.classList.add('wf-loading');
    const timeout = setTimeout(() => {
      document.documentElement.classList.remove('wf-loading');
      document.documentElement.classList.add('wf-inactive');
    }, 3000);

    return () => {
      clearTimeout(timeout);
      document.head.removeChild(script);
    };
  }, []);
  return null;
}
