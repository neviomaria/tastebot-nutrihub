import CookieConsent from "react-cookie-consent";

export const CookieBanner = () => {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Accetta"
      declineButtonText="Rifiuta"
      enableDeclineButton
      style={{
        background: "#2B373B",
        fontSize: "16px",
        padding: "16px",
      }}
      buttonStyle={{
        background: "#8B5CF6",
        color: "white",
        fontSize: "16px",
        borderRadius: "6px",
        padding: "8px 16px",
      }}
      declineButtonStyle={{
        background: "transparent",
        border: "1px solid white",
        color: "white",
        fontSize: "16px",
        borderRadius: "6px",
        padding: "8px 16px",
      }}
    >
      Utilizziamo i cookie per migliorare la tua esperienza sul nostro sito. Continuando a utilizzare questo sito, accetti la nostra{" "}
      <a href="/privacy-policy" className="text-primary-hover underline">
        Privacy Policy
      </a>
      .
    </CookieConsent>
  );
};