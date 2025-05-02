import { useEffect } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { initAnimations } from "@/lib/animation";
import "@/styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  // Initialize GSAP animations on client-side
  useEffect(() => {
    initAnimations();
  }, []);

  return (
    <>
      <Head>
        {/* Adobe Fonts (Typekit) */}
        <script>
          {`
            (function(d) {
              var config = {
                kitId: 'YOUR_TYPEKIT_KIT_ID',
                scriptTimeout: 3000,
                async: true
              },
              h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
            })(document);
          `}
        </script>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
