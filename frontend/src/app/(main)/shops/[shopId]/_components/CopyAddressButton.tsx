"use client";

import { useState } from "react";

import { CopyIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";

type Props = Readonly<{
  address: string;
}>;

export function CopyAddressButton({ address }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <Button
      variant="ghost"
      size="small"
      leftIcon={<CopyIcon className="size-4!" />}
      onClick={handleCopy}
      aria-label={`${address} 주소 복사`}
      className="shrink-0 px-2 text-black-500! text-12!"
    >
      {copied ? "복사완료" : "복사하기"}
    </Button>
  );
}
