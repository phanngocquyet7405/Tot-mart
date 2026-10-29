export default function AuthButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full min-h-11 py-3 px-4 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
}
