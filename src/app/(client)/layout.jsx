import MerchantRedirectGuard from "./MerchantRedirectGuard";

export default function ClientLayout({ children }) {
  return (
    <>
      <MerchantRedirectGuard />
      {children}
    </>
  );
}
