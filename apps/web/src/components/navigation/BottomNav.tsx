"use client";

/**
 * BottomNav Component
 *
 * Mobile/Native bottom navigation bar.
 * Only visible on mobile devices, PWA, or native apps.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCapacitor, usePlatform } from "@/hooks";

const navItems = [
  { href: "/", label: "Home", icon: "\u{1F3E0}", activeIcon: "\u{1F3E1}" },
  {
    href: "/mine",
    label: "Mine",
    icon: "\u{26CF}\u{FE0F}",
    activeIcon: "\u{26CF}\u{FE0F}",
  },
  {
    href: "/wallet",
    label: "Wallet",
    icon: "\u{1F4B0}",
    activeIcon: "\u{1F4B5}",
  },
  {
    href: "/nfts",
    label: "NFTs",
    icon: "\u{1F3A8}",
    activeIcon: "\u{1F5BC}\u{FE0F}",
  },
  {
    href: "/settings",
    label: "More",
    icon: "\u{2699}\u{FE0F}",
    activeIcon: "\u{2699}\u{FE0F}",
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { haptic, isNative } = useCapacitor();
  const { isMobile, isPWA, isReady } = usePlatform();

  // Only show on mobile, PWA, or native
  const shouldShow = isReady && (isMobile || isPWA || isNative);

  const handlePress = async () => {
    if (isNative) {
      await haptic("light");
    }
  };

  if (!shouldShow) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-pixel-bg-medium border-t-4 border-pixel-border safe-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handlePress}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center w-16 h-full touch-feedback ${
                isActive ? "text-pixel-primary" : "text-pixel-text-muted"
              }`}
            >
              <span className="text-2xl" aria-hidden="true">
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span
                className={`font-pixel text-[8px] mt-1 ${
                  isActive ? "text-pixel-primary" : "text-pixel-text-muted"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
