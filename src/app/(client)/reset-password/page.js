import PasswordRecovery from "../components/ui/auth/PasswordRecovery";

export default async function ResetPasswordPage({ searchParams }) {
  const params = await searchParams;
  return <PasswordRecovery reset token={typeof params.token === "string" ? params.token : ""} />;
}
