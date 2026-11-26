import Image from "next/image";

export default function EblLogo() {
  return (
    <Image
      src="/ebl-logo.png"
      alt="Eastern Bank PLC."
      width={250}
      height={47}
      className="h-auto max-w-full"
    />
  );
}