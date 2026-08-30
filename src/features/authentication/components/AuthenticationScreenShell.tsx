import Image from "next/image";

interface AuthenticationScreenShellProps {
  children: React.ReactNode;
  image: string;
}

const AuthenticationScreenShell = ({ children, image }: AuthenticationScreenShellProps) => {
  const phQuinas = "/images/ph-quinas.png";

  return (
    <div className="bg-black min-h-screen w-full flex flex-col items-center justify-center sm:justify-start">
      {/* - Seção 1: Lado esquerdo - */}

      <div
        className="hidden md:block absolute inset-0 overflow-hidden"
        style={{ clipPath: "polygon(0% 30%, 33% 100%, 0% 100%)" }}
      >
        <Image
          src={phQuinas}
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* - Seção 2: centro - */}

      <div className="relative flex justify-center items-center w-full sm:min-h-10 min-h-screen md:[clip-path:polygon(0%_0%,67%_0%,100%_70%,100%_100%,33%_100%,0%_30%)]">
        <Image
          src={image}
          alt=""
          fill
          className="object-cover object-center -z-10"
          priority
        />

        {children}

        {/* - Bordas - */}

        <svg
          className="hidden md:block absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line
            x1="67"
            y1="0"
            x2="100"
            y2="70"
            stroke="#B8860B"
            strokeWidth="0.3"
          />
        </svg>

        <svg
          className="hidden md:block absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line
            x1="0"
            y1="30"
            x2="33"
            y2="100"
            stroke="#B8860B"
            strokeWidth="0.3"
          />
        </svg>
      </div>

      {/* - Seção 3: Lado direito - */}

      <div
        className="hidden md:block absolute inset-0 overflow-hidden"
        style={{ clipPath: "polygon(100% 70%, 67% 0%, 100% 0%)" }}
      >
        <Image
          src={phQuinas}
          alt=""
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
};

export { AuthenticationScreenShell };
