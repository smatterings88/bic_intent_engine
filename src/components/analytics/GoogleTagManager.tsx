/** Google Tag Manager container for salesbreakdowninstitute.com */
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim() || "GTM-KQHFRMK8";

const GTM_HEAD_SCRIPT = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`;

/** Inline GTM bootstrap — render inside root layout `<head>` as early as possible. */
export function GoogleTagManagerHead() {
  return <script dangerouslySetInnerHTML={{ __html: GTM_HEAD_SCRIPT }} />;
}

/** Place immediately after the opening `<body>` tag. */
export function GoogleTagManagerBody() {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
