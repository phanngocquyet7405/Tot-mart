"use client";

export function Button({
  children,
  variant = "default",
  size = "md",
  loading = false,
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center gap-2 font-medium rounded-lg border transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    default:
      "bg-white border-gray-200 text-gray-800 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800",
    primary: "bg-blue-700 border-blue-700 text-white hover:bg-blue-800",
    danger: "bg-red-700 border-red-700 text-white hover:bg-red-800",
    ghost:
      "border-transparent bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
    outline:
      "bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };
  return (
    <button
      disabled={loading || props.disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}

export function Badge({ children, color = "gray" }) {
  const colors = {
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    green:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    amber:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
}

export function Input({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 text-sm rounded-lg border bg-white text-gray-900 placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors
          dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : "border-gray-200"}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-3 py-2 text-sm rounded-lg border bg-white text-gray-900 placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none
          dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100
          ${error ? "border-red-400" : "border-gray-200"} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {label}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 text-sm rounded-lg border bg-white text-gray-900
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors
          dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100
          ${error ? "border-red-400" : "border-gray-200"} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div
      className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className = "" }) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}

export function Alert({ children, type = "error" }) {
  const styles = {
    error:
      "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
    success:
      "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
    warning:
      "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300",
  };
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm ${styles[type]}`}
    >
      {children}
    </div>
  );
}

export function Spinner({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.2"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}

export function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-5">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-gray-300 dark:text-gray-600">/</span>}
          {item.href ? (
            <a
              href={item.href}
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function FormSection({ title, description, children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="md:col-span-2 space-y-4">{children}</div>
    </div>
  );
}

export function fmtPrice(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

export function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN");
}

export const PLAN_LABELS = {
  "1_month": "1 tháng",
  "3_month": "3 tháng",
  "6_month": "6 tháng",
  "12_month": "12 tháng",
};

export const STATUS_CONFIG = {
  active: { label: "Đang hoạt động", color: "green" },
  cancelled: { label: "Đã huỷ", color: "red" },
  expired: { label: "Hết hạn", color: "gray" },
};
