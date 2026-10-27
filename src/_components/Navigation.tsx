"use client";
import Image from "next/image";
import Link from "next/link";
import { Session } from "next-auth";
import { Menu, Map, BarChart3, Download, Ship, X } from "lucide-react";
import { Button } from "./ui/button";
import { UserMenu } from "./UserMenu";
import { useState } from "react";
import { navLinksMobile } from "@/_styles/text";
import { usePathname } from "next/navigation";
import VesselSearch from "./VesselSearch";

type NavigationProps = {
  session: Session | null;
  Logout?: React.ComponentType;
};

// Logout is passed as a prop instead of being imported directly
// to avoid loading Supabase-dependent code in Cypress component tests.
export default function Navigation({ session, Logout: LogoutComponent = () => null }: NavigationProps) {
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const Logo = (
    <div className="flex items-center gap-3" data-testid="marlin-logo">
      <Image src="/marlin_logo.webp" alt="Marlin Logo" className="h-10 w-10" width={20} height={20} />
      <div className="text-left hidden sm:block" data-testid="marlin-brand">
        <h1 className="text-ocean-blue">MARLIN</h1>
        <p className="text-xs text-muted-foreground">Maritime Monitoring</p>
      </div>
    </div>
  );

  const linkClass = (href: string) =>
    `transition-colors hover:text-muted-foreground ${
      pathname === href ? "bg-accent text-ocean-blue hover:text-ocean-blue px-4 py-2 rounded-sm" : "text-grey"
    }`;

  const mobileNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/export", label: "Data Export", icon: Download },
    ...(session?.user?.role === "admin" ? [
      { href: "/vessels", label: "Vessels", icon: Ship }] : [] ),
    { href: "/map", label: "Map", icon: Map },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <nav
        data-testid={session ? "navigation-logged-in" : "navigation-logged-out"}
        className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
          mobileMenuOpen
            ? "bg-card"
            : "bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60"
        }`}
      >
        <div className="flex items-center justify-between px-4 xl:px-0 py-4 container mx-auto xl:px-0 px-8">
          {/* Logo and Brand */}
          <div className="flex items-center gap-6">

            {Logo}

            {/* Desktop Navigation (only for logged-in users) */}
            {session && (
              <div className="hidden lg:flex items-center gap-10 mx-6 text-grey">
                <Link href="/dashboard" className={linkClass("/dashboard")}>
                  Dashboard
                </Link>

                <Link href="/map" className={linkClass("/map")}>
                  Map
                </Link>

                {/* Admin-only links */}
                {session.user?.role === "admin" && (
                  <Link href="/vessels" className={linkClass("/vessels")}>
                    Vessels
                  </Link>
                )}

                <Link href="/export" className={linkClass("/export")}>
                  Data Export
                </Link>

              </div>
            )}
          </div>

          {session && (
            <div className="flex items-center gap-3">

              {session.user?.role === "admin" && <VesselSearch />}

              <UserMenu session={session} LogoutComponent={LogoutComponent} />

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" data-testid="mobile-menu-open"/>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Side Navigation */}
        <div
          data-testid="mobile-side-nav"
          className={`fixed top-0 left-0 z-50 w-[280px] sm:w-[320px] bg-white flex flex-col min-h-screen transition-transform duration-300 ease-in-out lg:hidden ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-4 border-b">
            <div className="flex items-center gap-3">
              {Logo}
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xs opacity-70 hover:opacity-100 transition-opacity p-1"
              data-testid="mobile-menu-close"
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          {/* Nav Links */}
          <div className="flex flex-col gap-4 flex-1 py-4 px-3 bg-white">
            {mobileNavItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;

              return (
                <Button
                  key={href}
                  variant="ghost"
                  asChild
                  className={`${navLinksMobile} ${
                    active ? "bg-accent text-ocean-blue hover:bg-accent" : ""
                  }`}
                >
                  <Link
                    data-testid={`mobile-link-${label.toLowerCase().replace(/\s+/g, "-")}`}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
