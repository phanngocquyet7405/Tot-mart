
export default function AuthButton({children,onClick,type="button"}) {
    return (
        <button
        type={type}
        onClick={onClick}
        className="w-full py-3 px-4 bg-[#e2b12b] text-white rounded-xl transition-all duration-200 hover:bg-[#e0eb47] active:scale-[0.98] shadow-md hover:shadow-lg"
    >
        {children}
    </button>
    );
}