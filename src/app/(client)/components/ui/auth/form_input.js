export default function FormInput({
    Label,
    type = "text",
    id,
    value,
    onChange,
    placeholder,
    required = false
}) {
    return (
        <div className="space-y-2">
            <label
            htmlFor={id}
            className="block text-sm font-medium text-[#f0dca4]"
            >
            {Label}
            </label>
            <input
            type={type}
            id={id}
            name={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
            />
        </div>
    )
}