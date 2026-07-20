export default function AuthCard({children}) {
    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-10 space-y-6 border border-gray-100 backdrop-blur-sm">
            {children}
        </div>
    );
}
