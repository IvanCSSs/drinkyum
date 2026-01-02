import Image from "next/image";
import Link from "next/link";

// Mobile/Tablet logo that appears at top of page content (scrolls with page)
export default function MobileLogo() {
  return (
    <div className="lg:hidden absolute top-10 left-1/2 -translate-x-1/2 z-40">
      <Link href="/">
        <Image
          src="/images/logo.svg"
          alt="YUM - DrinkYUM"
          width={120}
          height={60}
          className="h-[60px] w-auto"
          priority
        />
      </Link>
    </div>
  );
}


