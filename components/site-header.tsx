"use client"

import { Suspense } from "react"
import Link from "next/link"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Icons.logo className="size-6" />
          <span className="inline-block font-bold">{siteConfig.name}</span>
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2">
          <Suspense fallback={<div>Loading...</div>}>
            <MainNav />
          </Suspense>
        </div>

        <nav className="flex items-center space-x-1">
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
          >
            <div
              className={buttonVariants({
                size: "icon",
                variant: "ghost",
              })}
            >
              <Icons.gitHub className="size-5" />
              <span className="sr-only">GitHub</span>
            </div>
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
