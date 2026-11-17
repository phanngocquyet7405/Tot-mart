export default function AuthCard({ children }) {
  return (
    <div className="w-full max-w-md bg-card rounded-2xl shadow-xs p-6 sm:p-8 space-y-6 border border-border">
      {children}
    </div>
  );
}
