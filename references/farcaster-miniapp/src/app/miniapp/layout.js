import FarcasterProvider from "@/Providers/Providers";


export default function MiniAppLayout({ children }) {
  return (
    <FarcasterProvider>
      <main className="w-full max-w-7xl mx-auto  min-h-screen flex justify-center items-center">
        {children}
      </main>
    </FarcasterProvider>
  );
}
