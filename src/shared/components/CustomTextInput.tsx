export interface TextInputProps {
  className?: string;
  type?: string;
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string | number;
  onChange?: (value: string | number) => void;
  maxLength: number;
  readOnly?: boolean;
}

const CustomTextInput = ({
  className,
  type,
  icon,
  label,
  placeholder,
  value,
  onChange,
  maxLength,
}: TextInputProps) => (
  /* - Input wrapper - */

  <div className="flex flex-col">
    {/* - Título do input - */}

    <span className="text-sm text-white/60 font-semibold mb-1 mt-2 md:mb-2 md:mt-4 capitalize">
      {label}
    </span>

    {/* - Ícone do input - */}

    <div
      className={`flex w-full rounded-lg px-4 py-2 bg-[#1A1A1A] ${className ?? ""}`}
    >
      <span className="text-[#B8860B] mr-2 my-auto">{icon}</span>

      <input
        className="bg-transparent flex-1 outline-none text-sm text-white/60 placeholder:text-white/40 font-normal"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange!(e.target.value)}
        maxLength={maxLength}
      />
    </div>
  </div>
);

export { CustomTextInput };
