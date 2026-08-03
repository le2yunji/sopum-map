import type {
  SocialLoginConfig,
  SocialProvider,
} from "./SocialLoginButton.types";

export const SOCIAL_LOGIN_CONFIG: Record<SocialProvider, SocialLoginConfig> = {
  naver: {
    label: "네이버로 계속하기",
    iconSrc: "/images/icons/social/naver.svg",
    iconSize: 18,
    style: {
      backgroundColor: "#03C75A",
      borderColor: "#03C75A",
      color: "#FFFFFF",
    },
  },

  google: {
    label: "Google로 계속하기",
    iconSrc: "/images/icons/social/google.svg",
    iconSize: 20,
    style: {
      backgroundColor: "#FFFFFF",
      borderColor: "#888888",
      color: "#1F1F1F",
    },
  },

  apple: {
    label: "Apple로 계속하기",
    iconSrc: "/images/icons/social/apple.svg",
    iconSize: 18,
    style: {
      backgroundColor: "#000000",
      borderColor: "#000000",
      color: "#FFFFFF",
    },
  },

  kakao: {
    label: "카카오로 계속하기",
    iconSrc: "/images/icons/social/kakao.svg",
    iconSize: 20,
    style: {
      backgroundColor: "#FEE500",
      borderColor: "#FEE500",
      color: "#191919",
    },
  },
};
