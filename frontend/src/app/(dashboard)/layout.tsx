import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function DashboardGroup({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
