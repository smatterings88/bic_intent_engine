import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminSegmentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminGuard>
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <AdminNav />
        <div className="min-w-0 flex-1 space-y-6">{children}</div>
      </div>
    </AdminGuard>
  );
}
