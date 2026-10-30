export default function FormInput({
  Label,
  label,
  type = "text",
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  minLength,
  autoComplete,
  error,
}) {
  const displayLabel = Label || label;
  const inputName = name || id;
  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div className="space-y-1.5 text-left">
      {displayLabel && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-foreground"
        >
          {displayLabel}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={inputName}
        value={value}
        minLength={minLength}
        autoComplete={autoComplete}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={errorId}
        className="w-full min-h-11 px-3.5 py-2.5 text-sm rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive-text font-medium mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
