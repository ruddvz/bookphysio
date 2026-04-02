import Image from 'next/image'

export default function BpLogo() {
  return (
    <div className="flex items-center gap-2.5 mb-7">
      <Image 
        src="/logo.png" 
        alt="BookPhysio" 
        width={140}
        height={36}
        className="h-[36px] w-auto object-contain"
        priority
      />
    </div>
  )
}
