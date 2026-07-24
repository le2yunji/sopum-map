export interface HeartIconProps extends React.SVGProps<SVGSVGElement> {
  filled?: boolean;
}

export const HeartIcon = ({ filled = false, ...props }: HeartIconProps) => {
  return (
    <svg
      viewBox="0 0 52 46"
      aria-hidden="true"
      fill={filled ? "currentColor" : "none"}
      {...props}
    >
      <path
        d="M25.9031 9.52637C25.9031 9.52637 29.9031 1.90137 38.0181 1.90137C44.6131 1.90137 49.8356 7.16023 49.9031 13.4354C50.0393 26.461 39.0606 35.7242 27.0281 43.5089C26.6963 43.724 26.3043 43.839 25.9031 43.839C25.5018 43.839 25.1098 43.724 24.7781 43.5089C12.7443 35.7242 1.76557 26.461 1.90307 13.4354C1.97057 7.16023 7.19307 1.90137 13.7881 1.90137C21.9031 1.90137 25.9031 9.52637 25.9031 9.52637Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
      />
    </svg>
  );
};
