export async function generateStaticParams() { return [] as never[] }

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
