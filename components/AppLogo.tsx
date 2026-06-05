interface AppLogoProps {
  size?: number;
  className?: string;
}

export default function AppLogo({ size = 32, className = "" }: AppLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <rect width="64" height="64" rx="14" fill="#3B5BDB"/>
      <circle cx="32" cy="32" r="13" stroke="white" strokeWidth="3.5"/>
      <rect x="22" y="28.5" width="20" height="3" rx="1.5" fill="white"/>
      <rect x="22" y="34.5" width="14" height="3" rx="1.5" fill="white"/>
      <rect x="22" y="22.5" width="16" height="3" rx="1.5" fill="white"/>
    </svg>
  );
}
