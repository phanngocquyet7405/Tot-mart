export default function FormInput({
    Label,
    type = "text",
    id,
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false
}) {
    return (
        <div className="space-y-2">
            <label
            htmlFor={id}
            className="block text-sm font-semibold text-gray-700"
            >
            {Label}
            </label>
            <input
            type={type}
            id={id}
            name={id}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
            />
        </div>
    )
}
