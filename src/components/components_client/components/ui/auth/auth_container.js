export default function AuthContainer({ children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/organic.png")'}}></div>
      
      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  );
}
