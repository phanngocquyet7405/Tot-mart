export default function AuthContainer({ children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#426545] relative overflow-hidden p-4">
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
      
      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  );
}