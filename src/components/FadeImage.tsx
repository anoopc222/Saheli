"use client";

import { useState } from "react";
import Image from "next/image";

export function FadeImage({
  src,
  alt,
  className,
  lazy = true,
  sizes = "50vw",
}: {
  src: string;
  alt: string;
  className?: string;
  lazy?: boolean;
  sizes?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      loading={lazy ? "lazy" : "eager"}
      priority={!lazy}
      onLoad={() => setLoaded(true)}
      style={{ transition: "opacity 400ms ease", opacity: loaded ? 1 : 0 }}
      className={className}
    />
  );
}
