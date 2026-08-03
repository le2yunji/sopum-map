import type { CSSProperties } from "react";

import type { ButtonProps } from "@/components/ui/Button";

export type SocialProvider = "naver" | "google" | "apple" | "kakao";

export type SocialLoginButtonProps = Omit<
  ButtonProps,
  "children" | "variant" | "iconOnly" | "leftIcon" | "rightIcon" | "fullWidth"
> & {
  provider: SocialProvider;
};

export type SocialLoginConfig = {
  label: string;
  iconSrc: string;
  iconSize: number;
  style: CSSProperties;
};
