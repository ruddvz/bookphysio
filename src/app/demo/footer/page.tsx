import Footer from "@/components/ui/footer";

export default function DemoOne() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-bp-surface flex items-center justify-center p-20">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-bp-primary mb-4">Footer Component Demo</h1>
            <p className="text-bp-body">Scroll down to see the integrated premium footer.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
