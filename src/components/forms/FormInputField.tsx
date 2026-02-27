interface FormInputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  type?: "text" | "email" | "number" | "tel";
  isCurrency?: boolean;
}

export const FormInputField = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  isCurrency = false,
}: FormInputFieldProps) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-[#0f0b36] ml-1">
        {label}
      </label>
      
      <div className="relative group">
        {isCurrency && (
          <span className="absolute left-6 top-5 text-gray-400 font-bold transition-colors group-focus-within:text-[#0f0b36]">
            $
          </span>
        )}
        
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full p-5 ${isCurrency ? "pl-12" : ""} bg-gray-50/50 border ${
            error ? "border-red-500" : "border-gray-200"
          } rounded-2xl focus:ring-4 focus:ring-[#ff7a3d]/10 focus:border-[#ff7a3d] outline-none transition-all font-medium`}
        />
      </div>

      {error && (
        <span className="text-red-500 text-xs ml-1 font-medium animate-in fade-in slide-in-from-top-1">
          {error}
        </span>
      )}
    </div>
  );
};