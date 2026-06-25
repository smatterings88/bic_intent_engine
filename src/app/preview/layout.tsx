import { AppProviders } from "@/app/providers";

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
