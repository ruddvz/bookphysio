export default function BpIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 32 32" 
      fill="none" 
      aria-hidden="true"
      className={className}
    >
      <circle cx="16" cy="16" r="16" fill="#0F172A"/>
      <path d="M11 8V24M11 8H18C20.2091 8 22 9.79086 22 12C22 14.2091 20.2091 16 18 16M11 16H19C21.2091 16 23 17.7909 23 20C23 22.2091 21.2091 24 19 24H11" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  )
}
