"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  src?: string | null;
};

const BOX_CLASS = "w-9 h-9 shrink-0 border border-ink";

// Product thumbnail that falls back to an empty box when there is no image
// or the external host (e.g. Open Food Facts) fails to deliver it.
export const ProductThumb = ({ src }: Props) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <span aria-hidden="true" className={`${BOX_CLASS} bg-paper`} />;
  }

  return (
    <Image
      src={src}
      alt=""
      width={36}
      height={36}
      onError={() => setFailed(true)}
      className={`${BOX_CLASS} object-cover`}
    />
  );
};
