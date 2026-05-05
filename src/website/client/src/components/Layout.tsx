import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-[#313338] text-white overflow-hidden select-none">
      {children}
    </div>
  );
}
