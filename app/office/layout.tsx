import OfficeNav from "./nav";

export default function OfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0b0d12] text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6">
        <OfficeNav />
      </div>
      {children}
    </div>
  );
}
