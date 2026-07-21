"use client";

import { useState } from "react";

export function FadeImage({
  src,
  alt,
  className,
  lazy = true,
}: {
  src: string;
  alt: string;
  className?: string;
  lazy?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={lazy ? "lazy" : "eager"}
      decoding="async"
      onLoad={() => setLoaded(true)}
      style={{ transition: "opacity 400ms ease", opacity: loaded ? 1 : 0 }}
      className={className}
    />
  );
}
