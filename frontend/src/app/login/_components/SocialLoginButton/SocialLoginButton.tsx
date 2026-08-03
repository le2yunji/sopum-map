import Image from "next/image";

import { Button } from "@/components/ui/Button";

import { SOCIAL_LOGIN_CONFIG } from "./SocialLoginButton.constants";
import type { SocialLoginButtonProps } from "./SocialLoginButton.types";

export function SocialLoginButton({
  provider,
  className = "",
  style,
  ...props
}: SocialLoginButtonProps) {
  const config = SOCIAL_LOGIN_CONFIG[provider];

  return (
    <Button
      {...props}
      variant="outline"
      size="medium"
      fullWidth
      className={[
        "relative h-12 rounded-lg",
        "hover:opacity-90 active:opacity-80",
        "disabled:opacity-50",
        "[&>span]:w-full",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...config.style,
        ...style,
      }}
    >
      <span className="grid w-full grid-cols-[24px_1fr_24px] items-center">
        <span className="flex items-center justify-center">
          <span
            className="relative block shrink-0"
            style={{
              width: config.iconSize,
              height: config.iconSize,
            }}
          >
            <Image
              src={config.iconSrc}
              alt={`${provider} 아이콘`}
              fill
              sizes={`${config.iconSize}px`}
              className="object-contain"
              aria-hidden="true"
            />
          </span>
        </span>

        <span className="text-center">{config.label}</span>

        <span aria-hidden="true" />
      </span>
    </Button>
  );
}
