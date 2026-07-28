import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const colors = [
  {
    name: "Brand",
    value: "#738547",
    backgroundClass: "bg-brand-deep",
    textClass: "text-white",
  },
  {
    name: "Brand Bright",
    value: "#6EB746",
    backgroundClass: "bg-brand",
    textClass: "text-white",
  },
  {
    name: "Brand Soft",
    value: "#DDE5A9",
    backgroundClass: "bg-brand-soft",
    textClass: "text-foreground",
  },
  {
    name: "Foreground",
    value: "#1C1C1C",
    backgroundClass: "bg-foreground",
    textClass: "text-white",
  },
  {
    name: "Secondary",
    value: "#484848",
    backgroundClass: "bg-secondary",
    textClass: "text-white",
  },
  {
    name: "Muted",
    value: "#888888",
    backgroundClass: "bg-muted",
    textClass: "text-white",
  },
  {
    name: "Danger",
    value: "#F87171",
    backgroundClass: "bg-danger",
    textClass: "text-white",
  },
  {
    name: "Accent Pink",
    value: "#F9A8BE",
    backgroundClass: "bg-accent-pink",
    textClass: "text-foreground",
  },
  {
    name: "Accent Cream",
    value: "#FCF2D3",
    backgroundClass: "bg-accent-cream",
    textClass: "text-foreground",
  },
] as const;

const meta = {
  title: "Foundations/Colors",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Palette: Story = {
  render: () => (
    <section className="min-h-dvh bg-background p-5">
      <h1 className="mb-6 text-24 font-bold text-foreground">Colors</h1>

      <div className="grid grid-cols-2 gap-3">
        {colors.map(({ name, value, backgroundClass, textClass }) => (
          <div
            key={name}
            className={`flex aspect-square flex-col justify-end rounded-2xl p-4 ${backgroundClass} ${textClass}`}
          >
            <strong className="text-14 font-semibold">{name}</strong>
            <span className="mt-1 text-12 font-regular opacity-80">
              {value}
            </span>
          </div>
        ))}
      </div>
    </section>
  ),
};
