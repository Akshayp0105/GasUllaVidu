"use client";

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

const HIDDEN_PATHS = ['/dashboard', '/auth/', '/onboarding'];

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const hide = HIDDEN_PATHS.some(p => pathname?.startsWith(p));
  if (hide) return null;
  return <Navbar />;
}
