"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarContext = React.createContext<{
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}>({
  collapsed: false,
  setCollapsed: () => null
})

export function SidebarProvider({ 
  children,
  defaultCollapsed = false 
}: { 
  children: React.ReactNode
  defaultCollapsed?: boolean
}) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
  
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function Sidebar({ 
  className,
  children,
  defaultCollapsed = false,
}: { 
  className?: string
  children: React.ReactNode
  defaultCollapsed?: boolean
}) {
  return (
    <SidebarProvider defaultCollapsed={defaultCollapsed}>
      <aside 
        className={cn(
          "transition-all duration-300 ease-in-out",
          "min-w-[320px] max-w-[400px]", // Wider by default
          "md:relative md:block", // Show on larger screens
          "border-l bg-background",
          className
        )}
        style={{
          width: defaultCollapsed ? '0px' : undefined,
          overflow: defaultCollapsed ? 'hidden' : undefined
        }}
      >
        {children}
      </aside>
    </SidebarProvider>
  )
}

export function SidebarHeader({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const { collapsed } = useSidebar()
  
  return (
    <div className={cn(
      "border-b px-4 py-2",
      collapsed && "items-center justify-center",
      className
    )}>
      {children}
    </div>
  )
}

export function SidebarContent({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const { collapsed } = useSidebar()
  
  return (
    <div className={cn(
      "p-2",
      collapsed && "items-center",
      className
    )}>
      {children}
    </div>
  )
}

export function SidebarGroup({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  )
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export function SidebarCollapseButton() {
  const { collapsed, setCollapsed } = useSidebar()
  
  return (
    <button
      onClick={() => setCollapsed(!collapsed)}
      className="p-2 hover:bg-accent rounded-md"
    >
      {collapsed ? "→" : "←"}
    </button>
  )
}
