// Dashboard has its own sidebar navigation, so we suppress the global Navbar
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
