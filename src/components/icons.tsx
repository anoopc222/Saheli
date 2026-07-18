type IconProps = { className?: string };

export function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M3.5 10.5 12 4l8.5 6.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9.5V19a1 1 0 0 0 1 1H9.5v-5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5H17.5a1 1 0 0 0 1-1V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GridIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function TagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M20 12.5 12.5 20a1.5 1.5 0 0 1-2.12 0l-6.38-6.38a1.5 1.5 0 0 1 0-2.12L11.5 4H18a2 2 0 0 1 2 2v6.5Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="15" cy="9" r="1.25" />
    </svg>
  );
}

export function BagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M6.5 8.5h11l.9 11a1.5 1.5 0 0 1-1.5 1.6H7.1a1.5 1.5 0 0 1-1.5-1.6l.9-11Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TruckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M3 7h10v9H3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 10h4l3 3v3h-7z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}

export function ShieldCheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M12 3.5 5 6v5.5c0 4.2 3 7.6 7 9 4-1.4 7-4.8 7-9V6l-7-2.5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BoxIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M3.5 8 12 4l8.5 4-8.5 4-8.5-4Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 8v8l8.5 4 8.5-4V8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GlobeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.3 3.8 5.3 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.3-3.8-8.5s1.3-6.2 3.8-8.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ImageIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="9" cy="10" r="1.75" />
      <path d="M3.5 16.5 8.5 12l3 3 4-4.5 4.5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M19.5 19.5 15 15" strokeLinecap="round" />
    </svg>
  );
}

export function HeartIcon({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
    >
      <path
        d="M12 20.5s-7.5-4.6-10-9.3C.4 8 2 4.5 5.5 3.8c2-.4 4 .5 6.5 3 2.5-2.5 4.5-3.4 6.5-3 3.5.7 5.1 4.2 3.5 7.4-2.5 4.7-10 9.3-10 9.3Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path
        d="M12 3.5c.6 3 2 4.9 4.9 5.5-2.9.6-4.3 2.5-4.9 5.5-.6-3-2-4.9-4.9-5.5 2.9-.6 4.3-2.5 4.9-5.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 13.5c.3 1.6 1.1 2.6 2.6 2.9-1.5.3-2.3 1.3-2.6 2.9-.3-1.6-1.1-2.6-2.6-2.9 1.5-.3 2.3-1.3 2.6-2.9Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DressIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
      <path d="M9.5 3.5h5l.6 2.6 3.4 1.4-1.7 3-2.3-1v10.8a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V9.5l-2.3 1-1.7-3 3.4-1.4.6-2.6Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShirtIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
      <path d="M8.5 4 12 5.5 15.5 4 19 6.5l-2 3-2-1V20a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V8.5l-2 1-2-3L8.5 4Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DiamondIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
      <path d="M6 4h12l3 5-9 11L3 9l3-5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 9h18M9 4l-2 5 5 11 5-11-2-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PouchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
      <path d="M7 9.5h10l1 9a1.5 1.5 0 0 1-1.5 1.6H7.5A1.5 1.5 0 0 1 6 18.5l1-9Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 9V7a2.5 2.5 0 0 1 5 0v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function KidsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
      <path d="M12 3.5a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4Z" />
      <path d="M6 20.5v-6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 11.5v9M15 11.5v9" strokeLinecap="round" />
    </svg>
  );
}

export function StarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
      <path d="M12 3.8l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8L12 3.8Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PetalsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
      <circle cx="12" cy="7.2" r="2.4" />
      <circle cx="17.3" cy="14.5" r="2.4" />
      <circle cx="6.7" cy="14.5" r="2.4" />
      <circle cx="12" cy="14.8" r="1.6" />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" strokeLinecap="round" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
      <path d="M6 3.5h2.8l1.2 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.2V16a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4 4.7 2 2 0 0 1 6 3.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
      <path d="M6.5 17.5 4.5 20l2.6-.7A8 8 0 1 0 6.5 17.5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 9.5c0 4 2.5 6.5 6.5 6.5.6 0 1-.6.8-1.1l-.6-1.4a.9.9 0 0 0-1-.5l-1 .3a5 5 0 0 1-2.8-2.8l.3-1a.9.9 0 0 0-.5-1L9.6 8a1 1 0 0 0-1.1.8c0 .2-.1.4-.1.7Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M13.8 8.5h-1.3c-.8 0-1.2.5-1.2 1.3v1.4H13.8L13.4 13.4h-2.1V19h-1.9v-5.6H8V11.2h1.4V9.6C9.4 8 10.3 7 12 7h1.8v1.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M5 7h14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 7V5.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5V7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 7l.7 12a1.5 1.5 0 0 0 1.5 1.4h5.6a1.5 1.5 0 0 0 1.5-1.4L17 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.2 11v6M13.8 11v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
