export default function AuthContainer({ children }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-background px-4 py-8 sm:py-12">
      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  );
}
