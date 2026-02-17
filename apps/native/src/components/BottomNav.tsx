"use client";

/**
 * BottomNav - Mobile bottom navigation
 *
 * Tab-based navigation for the native app.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCapacitor } from "@/hooks";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  activeIcon: string;
}

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: "&#127968;",
    activeIcon: "&#127969;",
  },
  {
    href: "/mine",
    label: "Mine",
    icon: "&#9935;",
    activeIcon: "&#9935;",
  },
  {
    href: "/wallet",
    label: "Wallet",
    icon: "&#128176;",
    activeIcon: "&#128181;",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: "&#9881;",
    activeIcon: "&#9881;",
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { haptic, isNative } = useCapacitor();

  const handlePress = async () => {
    if (isNative) {
      await haptic("light");
    }
  };

  return (
    <nav className="bottom-nav z-50">
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
              className={`flex flex-col items-center justify-center w-16 h-full touch-feedback ${
                isActive ? "text-pixel-primary" : "text-pixel-text-muted"
              }`}
            >
              <span
                className="text-2xl"
                dangerouslySetInnerHTML={{
                  __html: isActive ? item.activeIcon : item.icon,
                }}
              />
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

export default BottomNav;
