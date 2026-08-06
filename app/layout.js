import "./globals.css";
import Script from "next/script";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { getCurrentDbUser } from "@/lib/auth";
import { createPretaContextToken, pretaContextForUser, hashUserId } from "@/lib/preta-token";

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
  if (user) {
    try {
      // No raw PII in the token. `email` used to be sent here and was never targeted on —
      // it only put a real address into a third party's logs. `uid` replaces it: a salted
      // one-way hash that lets Preta count the same person across devices without being
      // able to identify them (see hashUserId).
      const ctx = {
        ...pretaContextForUser(user),
        role: user.role,
        uid: await hashUserId(user.id),
      };
      pretaCtxToken = await createPretaContextToken(ctx);
    } catch (e) {
      console.error("Preta context token error:", e.message);
    }
  }

  return (
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Anti-flicker lives entirely in the /boot script below — there is no inline
              snippet here any more. /boot is render-blocking in <head>, so the parser has
              not reached <body> when it runs: nothing has been painted yet, and hiding the
              page there is just as early as hiding it inline. Two copies only duplicated
              the work, and the inline one also left the page blank for its full 2s fallback
              whenever pretasystems.com was blocked or slow — with /boot alone, a blocked
              loader simply means the page renders untouched.

              Note this is NOT covered by the loader's own installGlobalAntiFlicker(): that
              bails on `document.readyState !== 'loading'`, and the loader is a ~119 KB
              gzipped async bundle that virtually always executes after parsing has finished.
              /boot is what actually guards the paint. */}
          <link rel="icon" href="/logo.png" sizes="any" />
          {/* The signed context token, read by the loader via data-ctx-var below.
              Embedding it here rather than letting the loader fetch /api/preta-token is
              worth roughly 0.35s warm and ~1.8s on a cold serverless start, and that fetch
              sits on the critical path — getRawContextJWT() is awaited BEFORE /evaluate is
              posted, so the two are serialised. It matters because /boot has the page hidden
              behind a 2s fallback: the fetch path can spend that entire budget and reveal the
              page before anything has been injected.

              This element MUST stay above the SmartCode. edgeDecisionCanStartNow() checks
              whether this variable is already assigned; if the script tag were parsed first
              the variable would still be empty and the early /evaluate kick-off would be
              skipped for every visitor.

              Only the token is exposed. A window.pretaUser object used to be emitted next to
              it for the client-side targeting path, but data-ctx-* puts the loader in edge
              mode, where checkTargeting() is bypassed and the loader never reads it
              (orchestrator/loader.js) — so it did nothing except publish the user's email,
              plan and role into the page source. */}
          {pretaCtxToken && (
            <script
              dangerouslySetInnerHTML={{
                __html: `window.__PRETA_CTX__=${JSON.stringify(pretaCtxToken)};`,
              }}
            />
          )}
          {/* Preta SmartCode — raw <script> in <head> so it appears in the
              server-rendered HTML (Preta's verifier fetches the page and greps
              for this tag).

              Points at the v1 loader (loader-v1 + /v1/api), which is what the
              creator-onboarding flow issues. It REPLACES the old main-loader tag rather
              than sitting beside it: the loader sets a global window.__PRETA_INITIALIZED__
              and any second copy logs "already initialized" and does nothing, so two
              loaders on one page means one of them is silently dead.

              Kept as the verbatim /boot form the dashboard hands out, so this file matches
              what support/docs will tell anyone to paste. /boot is a ~400B script that hides
              the page (window.__preta_af_clear + a 2s fallback reveal) and then appends the
              real loader (/?d=) with async, forwarding data-api / data-ctx-endpoint /
              data-ctx-token-key / data-ctx-var / data-debug onto it. It is the ONLY
              anti-flicker in this page — see the note above <link rel="icon">.

              No `async` here, matching the issued snippet — and load-bearing, not cosmetic:
              async would let the parser run ahead and paint body content before /boot hides
              it, which is the flicker this exists to prevent. /boot also reads its own
              attributes via document.currentScript, and running at parse time gets the real
              loader downloading as early as possible.

              Auth context is supplied twice on purpose — data-ctx-var is read synchronously
              from the token this layout already embedded (no fetch, no serverless cold
              start), and data-ctx-endpoint stays as the fallback for any render where the
              variable is missing. The loader prefers the var and falls back on its own. */}
          {/* Preta SmartCode Start */}
          <script
            src="https://loader-v2.pretasystems.com/boot?d=doctor-peach-delta.vercel.app"
            data-api="https://app.pretasystems.com/v2/api"
            data-ctx-var="__PRETA_CTX__"
            data-ctx-endpoint="/api/preta-token"
            data-debug="true"
          />
          {/* Preta SmartCode End */}
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
        {/* The Preta loader moved into <head> above (see the SmartCode comment there):
            it must be in the server-rendered HTML for install verification, and only one
            loader can run per page. */}
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
