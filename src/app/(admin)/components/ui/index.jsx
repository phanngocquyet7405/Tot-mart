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
      "bg-card border-border text-foreground hover:bg-muted/30 dark:border-border dark:text-foreground dark:hover:bg-muted",
    primary: "bg-primary border-primary text-primary-foreground hover:bg-primary/90",
    danger: "bg-destructive/90 border-destructive text-destructive-foreground hover:bg-destructive/90",
    ghost:
      "border-transparent bg-transparent text-muted-foreground hover:bg-muted dark:text-muted-foreground dark:hover:bg-muted",
    outline:
      "bg-transparent border-border text-foreground hover:bg-muted/30 border-border dark:text-muted-foreground",
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
    gray: "bg-muted text-foreground dark:bg-muted dark:text-muted-foreground",
    green:
      "bg-success/15 text-success-text bg-success/15 dark:text-success-text",
    red: "bg-destructive/15 text-destructive-text bg-destructive/15 dark:text-destructive-text",
    amber:
      "bg-warning/15 text-warning-text bg-warning/15 dark:text-warning-text",
    blue: "bg-primary/15 text-primary bg-primary/10 text-primary",
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
        <label className="text-xs font-medium text-muted-foreground dark:text-muted-foreground">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 text-sm rounded-lg border bg-card text-foreground placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors
          dark:bg-card dark:border-border dark:text-foreground
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-destructive/50 focus:ring-destructive/20 focus:border-destructive" : "border-border"}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-destructive-text">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-muted-foreground dark:text-muted-foreground">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-3 py-2 text-sm rounded-lg border bg-card text-foreground placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none
          dark:bg-card dark:border-border dark:text-foreground
          ${error ? "border-destructive/50" : "border-border"} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-destructive-text">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-muted-foreground dark:text-muted-foreground">
          {label}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 text-sm rounded-lg border bg-card text-foreground
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors
          dark:bg-card dark:border-border dark:text-foreground
          ${error ? "border-destructive/50" : "border-border"} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-destructive-text">{error}</p>}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-card border border-border dark:border-border rounded-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div
      className={`px-6 py-4 border-b border-border dark:border-border ${className}`}
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
      "bg-destructive/10 border-destructive/20 text-destructive-text bg-destructive/10 dark:border-destructive/30 dark:text-destructive-text",
    success:
      "bg-success/10 border-success/20 text-success-text bg-success/15 dark:border-success/30 text-success-text",
    warning:
      "bg-warning/10 border-warning/20 text-warning-text bg-warning/15 dark:border-warning/30 text-warning-text",
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
        <h1 className="text-xl font-semibold text-foreground dark:text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground">
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
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground dark:text-muted-foreground mb-5">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-muted-foreground dark:text-muted-foreground">/</span>}
          {item.href ? (
            <a
              href={item.href}
              className="hover:text-foreground dark:hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-foreground dark:text-foreground font-medium">
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-border dark:border-border last:border-0 last:pb-0">
      <div>
        <h3 className="text-sm font-medium text-foreground dark:text-foreground">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground dark:text-muted-foreground leading-relaxed">
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
