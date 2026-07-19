import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const textSizes = [
  { label: "10px", className: "text-10" },
  { label: "12px", className: "text-12" },
  { label: "14px", className: "text-14" },
  { label: "16px", className: "text-16" },
  { label: "18px", className: "text-18" },
  { label: "20px", className: "text-20" },
  { label: "22px", className: "text-22" },
  { label: "24px", className: "text-24" },
] as const;

const fontWeights = [
  { label: "Regular 400", className: "font-regular" },
  { label: "Medium 500", className: "font-medium" },
  { label: "Semi Bold 600", className: "font-semibold" },
  { label: "Bold 700", className: "font-bold" },
] as const;

const meta = {
  title: "Foundations/Typography",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const FontSizes: Story = {
  render: () => (
    <section className="min-h-dvh bg-surface p-5">
      <h1 className="mb-6 text-24 font-bold text-foreground">Typography</h1>

      <div className="space-y-4">
        {textSizes.map(({ label, className }) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-4 border-b border-border pb-3"
          >
            <span className="text-12 font-regular text-muted">{label}</span>

            <p className={`${className} font-regular text-foreground`}>
              소품지도의 폰트입니다
            </p>
          </div>
        ))}
      </div>
    </section>
  ),
};

export const FontWeights: Story = {
  render: () => (
    <section className="min-h-dvh bg-surface p-5">
      <h1 className="mb-6 text-24 font-bold text-foreground">Font Weight</h1>

      <div className="space-y-4">
        {fontWeights.map(({ label, className }) => (
          <div key={label} className="border-b border-border pb-3">
            <span className="text-12 text-muted">{label}</span>

            <p className={`mt-1 text-18 text-foreground ${className}`}>
              내 취향의 소품샵을 찾아보세요
            </p>
          </div>
        ))}
      </div>
    </section>
  ),
};
