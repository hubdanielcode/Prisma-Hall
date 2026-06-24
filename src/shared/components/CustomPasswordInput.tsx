import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import { RiLockPasswordFill } from "react-icons/ri";

export interface PasswordInputProps {
  className?: string;
  label: string;
  placeholder: string;
  value: string;
  onChange?: (value: string) => void;
  maxLength: number;
}

const CustomPasswordInput = ({
  className,
  label,
  placeholder,
  value,
  onChange,
  maxLength,
}: PasswordInputProps) => {
  /* - Estados de privacidade - */

  const [isPasswordPrivate, setIsPasswordPrivate] = useState<boolean>(true);

  return (
    <div className="flex flex-col">
      {/* - Título do input - */}

      <span className="text-sm text-white/60 font-semibold mb-1 mt-2 md:mb-2 md:mt-4 capitalize">
        {label}
      </span>

      {/* - Input - */}

      <div
        className={`flex w-full rounded-lg px-4 py-2 bg-[#1A1A1A] ${className}`}
      >
        <RiLockPasswordFill className="text-[#B8860B] mr-2 my-auto" />

        <input
          className="bg-transparent flex-1 outline-none text-sm text-white/60 placeholder:text-white/40 font-normal"
          type={isPasswordPrivate ? "password" : "text"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          maxLength={maxLength}
        />

        <button
          type="button"
          className="text-[#B8860B] cursor-pointer"
          onClick={() => setIsPasswordPrivate(!isPasswordPrivate)}
        >
          {isPasswordPrivate ? (
            <Eye className="h-5 w-5" />
          ) : (
            <EyeClosed className="h-5 w-5" />
          )}
        </button>
      </div>

      <span className="text-sm text-white/60 ml-2 mt-1 mb-3">
        Mínimo de 6 caracteres
      </span>
    </div>
  );
};

export { CustomPasswordInput };
