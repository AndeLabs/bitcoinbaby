"use client";

/**
 * MoreSection - Menu with additional options
 *
 * Links to:
 * - Settings
 * - Help
 * - Leaderboard
 * - Cosmic Events
 * - Characters
 * - About
 */

import Link from "next/link";
import { clsx } from "clsx";

interface MenuItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  href: string;
  external?: boolean;
  highlight?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: "settings",
    label: "Settings",
    description: "Mining, network, display preferences",
    icon: "⚙️",
    href: "/settings",
  },
  {
    id: "cosmic",
    label: "Cosmic Events",
    description: "Dynamic world events and bonuses",
    icon: "🌌",
    href: "/cosmic",
    highlight: true,
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    description: "Top miners and rankings",
    icon: "🏆",
    href: "/leaderboard",
  },
  {
    id: "characters",
    label: "Characters",
    description: "View all baby sprites and stages",
    icon: "👾",
    href: "/characters",
  },
  {
    id: "help",
    label: "Help & Guide",
    description: "How to play BitcoinBaby",
    icon: "❓",
    href: "/help",
  },
];

const SOCIAL_LINKS: MenuItem[] = [
  {
    id: "github",
    label: "GitHub",
    description: "View source code",
    icon: "📂",
    href: "https://github.com/bitcoinbaby/bitcoinbaby",
    external: true,
  },
  {
    id: "discord",
    label: "Discord",
    description: "Join our community",
    icon: "💬",
    href: "https://discord.gg/bitcoinbaby",
    external: true,
  },
  {
    id: "docs",
    label: "Documentation",
    description: "Technical docs",
    icon: "📚",
    href: "https://docs.bitcoinbaby.io",
    external: true,
  },
];

function MenuButton({ item }: { item: MenuItem }) {
  const content = (
    <div
      className={clsx(
        "flex items-center gap-4 p-4",
        "bg-pixel-bg-medium border-4 border-pixel-border",
        "shadow-[4px_4px_0_0_#000]",
        "hover:translate-x-[2px] hover:translate-y-[2px]",
        "hover:shadow-[2px_2px_0_0_#000]",
        "transition-all cursor-pointer",
        item.highlight && "border-pixel-primary",
      )}
    >
      {/* Icon */}
      <div className="w-12 h-12 flex items-center justify-center bg-pixel-bg-dark border-2 border-black text-2xl">
        {item.icon}
      </div>

      {/* Text */}
      <div className="flex-1">
        <h3
          className={clsx(
            "font-pixel text-xs uppercase",
            item.highlight ? "text-pixel-primary" : "text-pixel-text",
          )}
        >
          {item.label}
        </h3>
        <p className="font-pixel-body text-xs text-pixel-text-muted mt-1">
          {item.description}
        </p>
      </div>

      {/* Arrow */}
      <div className="font-pixel text-pixel-text-muted">→</div>
    </div>
  );

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return <Link href={item.href}>{content}</Link>;
}

export function MoreSection() {
  return (
    <div className="p-4 md:p-8 bg-pixel-bg-dark">
      <div className="max-w-2xl mx-auto">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="font-pixel text-xl text-pixel-primary">MORE</h2>
          <p className="font-pixel-body text-sm text-pixel-text-muted mt-1">
            Settings, help, and community
          </p>
        </div>

        {/* Main Menu */}
        <div className="space-y-3 mb-8">
          {MENU_ITEMS.map((item) => (
            <MenuButton key={item.id} item={item} />
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-1 bg-pixel-border" />
          <span className="font-pixel text-[8px] text-pixel-text-muted uppercase">
            Community
          </span>
          <div className="flex-1 h-1 bg-pixel-border" />
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SOCIAL_LINKS.map((item) => (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                "flex flex-col items-center gap-2 p-4",
                "bg-pixel-bg-medium border-4 border-pixel-border",
                "shadow-[4px_4px_0_0_#000]",
                "hover:translate-x-[2px] hover:translate-y-[2px]",
                "hover:shadow-[2px_2px_0_0_#000]",
                "hover:border-pixel-secondary",
                "transition-all",
              )}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-pixel text-[10px] text-pixel-text uppercase">
                {item.label}
              </span>
            </a>
          ))}
        </div>

        {/* Version Info */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-pixel-bg-medium border-4 border-pixel-border p-4">
            <p className="font-pixel text-[8px] text-pixel-text-muted uppercase mb-2">
              BitcoinBaby
            </p>
            <p className="font-pixel-mono text-sm text-pixel-text">
              v0.1.0-alpha
            </p>
            <p className="font-pixel text-[6px] text-pixel-text-muted mt-2">
              Built on Bitcoin with Charms Protocol
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoreSection;
