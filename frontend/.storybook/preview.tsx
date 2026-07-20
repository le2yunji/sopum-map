import type { Preview } from "@storybook/nextjs-vite";
import { MINIMAL_VIEWPORTS } from "storybook/viewport";

import { pretendard } from "../src/app/font";
import "../src/app/globals.css";

const sopumViewports = {
  sopumMobile: {
    name: "소품지도 기본 모바일",
    styles: {
      width: "390px",
      height: "844px",
    },
    type: "mobile",
  },

  sopumSmall: {
    name: "소형 모바일",
    styles: {
      width: "320px",
      height: "568px",
    },
    type: "mobile",
  },

  sopumLarge: {
    name: "대형 모바일",
    styles: {
      width: "480px",
      height: "900px",
    },
    type: "mobile",
  },
} as const;

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className={`${pretendard.variable} min-h-dvh font-sans`}>
        <div id="mobile-app">
          <Story />
        </div>
      </div>
    ),
  ],

  parameters: {
    layout: "fullscreen",

    nextjs: {
      appDirectory: true,
    },

    viewport: {
      options: {
        ...MINIMAL_VIEWPORTS,
        ...sopumViewports,
      },
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    backgrounds: {
      options: {
        app: {
          name: "앱 배경",
          value: "#ffffff",
        },
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },

  initialGlobals: {
    viewport: {
      value: "sopumMobile",
      isRotated: false,
    },

    backgrounds: {
      value: "app",
    },
  },

  tags: ["autodocs"],
};

export default preview;
