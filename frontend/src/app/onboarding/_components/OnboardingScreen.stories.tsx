import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, userEvent, within } from "storybook/test";

import {
  ONBOARDING_COOKIE_NAME,
  ONBOARDING_TRANSITION_MS,
} from "@/lib/onboarding/onboarding.constants";

import { OnboardingScreen } from "./OnboardingScreen";

type ScheduledTransition = {
  callback: () => void;
  remainingMs: number;
};

let scheduledTransition: ScheduledTransition | undefined;
let onboardingCookieWriteCount = 0;

/** 온보딩 전환 타이머만 가짜 시계에서 제어하도록 설치합니다. */
function installTransitionClock() {
  const originalSetTimeout = window.setTimeout;
  const originalClearTimeout = window.clearTimeout;
  const transitionTimerId = 1;

  window.setTimeout = ((handler: TimerHandler, timeout?: number) => {
    if (timeout === ONBOARDING_TRANSITION_MS && typeof handler === "function") {
      scheduledTransition = {
        callback: () => {
          handler();
        },
        remainingMs: timeout,
      };
      return transitionTimerId;
    }

    return originalSetTimeout(handler, timeout);
  }) as typeof window.setTimeout;

  window.clearTimeout = ((timerId?: number) => {
    if (timerId === transitionTimerId) {
      scheduledTransition = undefined;
      return;
    }

    originalClearTimeout(timerId);
  }) as typeof window.clearTimeout;

  return () => {
    window.setTimeout = originalSetTimeout;
    window.clearTimeout = originalClearTimeout;
  };
}

/** 가짜 시계를 진행해 예약한 온보딩 전환을 필요한 시점에 실행합니다. */
function advanceTransitionClock(milliseconds: number) {
  if (!scheduledTransition) {
    throw new Error("온보딩 전환 타이머가 예약되지 않았습니다.");
  }

  scheduledTransition.remainingMs -= milliseconds;

  if (scheduledTransition.remainingMs > 0) {
    return;
  }

  const transition = scheduledTransition;
  scheduledTransition = undefined;
  transition.callback();
}

/** 완료 쿠키의 실제 쓰기 횟수를 기록하고 테스트 뒤 원래 동작을 복구합니다. */
function trackOnboardingCookieWrites() {
  const cookieDescriptor = Object.getOwnPropertyDescriptor(
    Document.prototype,
    "cookie",
  );

  if (!cookieDescriptor?.get || !cookieDescriptor.set) {
    throw new Error("브라우저 쿠키 접근자를 찾지 못했습니다.");
  }

  onboardingCookieWriteCount = 0;
  document.cookie = `${ONBOARDING_COOKIE_NAME}=; Path=/; Max-Age=0`;

  Reflect.defineProperty(document, "cookie", {
    configurable: true,
    get: () => cookieDescriptor.get?.call(document) ?? "",
    set: (value: string) => {
      if (value.startsWith(`${ONBOARDING_COOKIE_NAME}=`)) {
        onboardingCookieWriteCount += 1;
      }

      cookieDescriptor.set?.call(document, value);
    },
  });

  return () => {
    Reflect.deleteProperty(document, "cookie");
    document.cookie = `${ONBOARDING_COOKIE_NAME}=; Path=/; Max-Age=0`;
  };
}

const meta = {
  title: "Pages/Onboarding/Screen",
  component: OnboardingScreen,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof OnboardingScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SplashToCompletion: Story = {
  beforeEach: () => {
    scheduledTransition = undefined;
    const restoreTransitionClock = installTransitionClock();
    const restoreCookieTracking = trackOnboardingCookieWrites();

    return () => {
      restoreTransitionClock();
      restoreCookieTracking();
      scheduledTransition = undefined;
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const router = getRouter();

    await expect(
      canvas.getByRole("heading", { name: "소품지도" }),
    ).toBeInTheDocument();
    await expect(scheduledTransition?.remainingMs).toBe(
      ONBOARDING_TRANSITION_MS,
    );

    advanceTransitionClock(1_499);
    await expect(
      canvas.getByRole("heading", { name: "소품지도" }),
    ).toBeInTheDocument();
    await expect(document.cookie).not.toContain(ONBOARDING_COOKIE_NAME);

    advanceTransitionClock(1);
    await expect(
      await canvas.findByRole("heading", {
        name: "취향에 맞는 소품샵을 발견해요",
      }),
    ).toBeInTheDocument();
    await expect(document.cookie).not.toContain(ONBOARDING_COOKIE_NAME);
    await expect(router.replace).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole("button", { name: "다음" }));
    await userEvent.click(canvas.getByRole("button", { name: "다음" }));
    await userEvent.click(canvas.getByRole("button", { name: "다음" }));

    const completeButton = canvas.getByRole("button", {
      name: "소품지도 시작하기",
    });
    await userEvent.click(completeButton);
    await userEvent.click(completeButton);

    await expect(onboardingCookieWriteCount).toBe(1);
    await expect(document.cookie).toContain(`${ONBOARDING_COOKIE_NAME}=1`);
    await expect(router.replace).toHaveBeenCalledTimes(1);
    await expect(router.replace).toHaveBeenCalledWith("/");
  },
};
