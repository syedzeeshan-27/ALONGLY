import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  sizes?: string;
};

type BrandMarkProps = BrandLogoProps & {
  alt?: string;
};

export function BrandWordmark({
  className = "h-10 w-auto",
  priority = false,
  sizes = "160px",
}: BrandLogoProps) {
  return (
    <Image
      alt="Alongly"
      className={`object-contain ${className}`}
      height={404}
      priority={priority}
      sizes={sizes}
      src="/brand/alongly-wordmark.png"
      width={1609}
    />
  );
}

export function BrandMark({
  alt = "",
  className = "h-10 w-10",
  priority = false,
  sizes = "40px",
}: BrandMarkProps) {
  return (
    <Image
      alt={alt}
      className={`object-contain ${className}`}
      height={695}
      priority={priority}
      sizes={sizes}
      src="/brand/alongly-mark.png"
      width={781}
    />
  );
}
