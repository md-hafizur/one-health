"use client"

import { BaseLayout } from "@/components/layouts/base-layout";
import { UserHeader } from "@/components/layouts/user-header";
import { UserSidebar } from "@/components/layouts/user-sidebar";
import { Footer } from "@/components/layouts/footer";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <BaseLayout
      header={<UserHeader />}
      sidebar={<UserSidebar />}
      footer={<Footer />}
    >
      {children}
    </BaseLayout>
  );
}
