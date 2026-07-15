import "./globals.css";
import Script from "next/script";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { getCurrentDbUser } from "@/lib/auth";
import { createPretaContextToken, pretaContextForUser } from "@/lib/preta-token";

export const metadata = {
  title: "Doctors Appointment App",
  description: "Connect with doctors anytime, anywhere",
};

export default async function RootLayout({ children }) {
  // Server-side: sign a short-lived Preta context token for the logged-in user
  // and expose it as window.__PRETA_CTX__ for the Preta loader (data-ctx-var).
  // Read the full DB user (not just the session JWT) so live plan / add-on
  // changes from the Billing page flow into the Preta context immediately.
  const user = await getCurrentDbUser();
  let pretaCtxToken = null;
  let pretaUser = null;
  if (user) {
    try {
      const ctx = {
        ...pretaContextForUser(user),
        role: user.role,
        email: user.email,
      };
      // Element loader (/?d=) targets on window.pretaUser (client-side). It needs an
      // `id` so the visitor isn't treated as a guest, plus the attributes so
      // "User Attributes" rules (plan / add_ons / risk_score / …) can match.
      pretaUser = { id: String(user.id), ...ctx };
      pretaCtxToken = await createPretaContextToken(ctx);
    } catch (e) {
      console.error("Preta context token error:", e.message);
    }
  }

  return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/logo.png" sizes="any" />
          {(pretaUser || pretaCtxToken) && (
            <script
              dangerouslySetInnerHTML={{
                __html: [
                  pretaUser
                    ? `window.pretaUser=${JSON.stringify(pretaUser)};`
                    : "",
                  pretaCtxToken
                    ? `window.__PRETA_CTX__=${JSON.stringify(pretaCtxToken)};`
                    : "",
                ].join(""),
              }}
            />
          )}
          {/* Preta SmartCode — raw <script> in <head> so it appears in the
              server-rendered HTML (Preta's verifier fetches the page and greps
              for this tag). */}
          <script src="https://hamza-phase-1.pushkarnagwekar.workers.dev/boot?d=doctor-peach-delta.vercel.app"
            data-api="https://preta-dashboardphasev1-1.pushkarnagwekar.workers.dev/api"
            data-ctx-var="__PRETA_CTX__"
            data-ctx-endpoint="/api/preta-token"
          ></script>
        </head>
     
<div data-preta-slot="page-top"></div>


        <Script id="segment-snippet" strategy="afterInteractive">
          {`
            !function(){var i="analytics",analytics=window[i]=window[i]||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","screen","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware","register"];analytics.factory=function(e){return function(){if(window[i].initialized)return window[i][e].apply(window[i],arguments);var n=Array.prototype.slice.call(arguments);if(["track","screen","alias","group","page","identify"].indexOf(e)>-1){var c=document.querySelector("link[rel='canonical']");n.push({__t:"bpc",c:c&&c.getAttribute("href")||void 0,p:location.pathname,u:location.href,s:location.search,t:document.title,r:document.referrer})}n.unshift(e);analytics.push(n);return analytics}};for(var n=0;n<analytics.methods.length;n++){var key=analytics.methods[n];analytics[key]=analytics.factory(key)}analytics.load=function(key,n){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.setAttribute("data-global-segment-analytics-key",i);t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r);analytics._loadOptions=n};analytics._writeKey="uujaytBec0IKw7feQ5OWz4LtxHlNceya";;analytics.SNIPPET_VERSION="5.2.0";
            analytics.load("uujaytBec0IKw7feQ5OWz4LtxHlNceya");
            analytics.page();
            }}();
          `}
        </Script>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-P0LL1DLQKN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-P0LL1DLQKN');
          `}
        </Script>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
            scriptProps={{ async: true }}
          >
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />

            <footer className="bg-muted/50 py-12">
              <div className="container mx-auto px-4 text-center text-gray-200">
                <p>Made with 💗 by RoadsideCoder</p>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
  );
}
