
export default function AuthButton({children, onClick, type = "button", disabled = false}) {
    return (
        <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className="w-full py-3 px-4 bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-green-800 active:scale-[0.98] shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
        {children}
    </button>
    );
}
