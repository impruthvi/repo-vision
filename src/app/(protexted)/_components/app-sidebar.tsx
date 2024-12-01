"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BotIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  PlusIcon,
  PresentationIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const items = [
  {
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    href: "/dashboard",
  },
  {
    title: "Q&A",
    icon: BotIcon,
    href: "/qa",
  },
  {
    title: "Meetings",
    icon: PresentationIcon,
    href: "/meetings",
  },
  {
    title: "Billing",
    icon: CreditCardIcon,
    href: "/billing",
  },
];

const projects = [
  {
    name: "p 1",
    id: 1,
  },
  {
    name: "Project 2",
    id: 2,
  },
  {
    name: "Project 3",
    id: 3,
  },
];

const AppSidebar = () => {
  const pathname = usePathname();
  const { open } = useSidebar();
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Image src={"/logo.svg"} alt="logo" width={40} height={40} />
          {open && (
            <h1 className="text-primary/80 text-xl font-bold">Repo Vision</h1>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.href}
                      className={cn({
                        "!bg-primary !text-white": pathname === item.href,
                      })}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.name}>
                  <SidebarMenuButton asChild>
                    <div className="">
                      <div
                        className={cn(
                          "text-primary flex size-6 items-center justify-center rounded-sm border bg-white text-sm",
                          {
                            "bg-primary text-white": true,
                            // "bg-primary text-white": projectId === project.id,
                          },
                        )}
                      >
                        {project.name[0]?.toUpperCase()}
                      </div>
                      <span>{project.name}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <div className="h-2"></div>
              {open && (
                <SidebarMenuItem>
                  <Button variant={"outline"} className="w-fit" asChild>
                    <Link href={"/create"}>
                      <PlusIcon />
                      Create Project
                    </Link>
                  </Button>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
