import CookieConsent from "react-cookie-consent";

export const CookieBanner = () => {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Accept"
      declineButtonText="Decline"
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
      We use cookies to enhance your experience on our website. By continuing to use this site, you accept our{" "}
      <a href="#" className="text-primary-hover underline">
        Privacy Policy
      </a>
      .
    </CookieConsent>
  );
};