import * as React from "react"
import {
  Home,
  Wallet,
  AlignHorizontalJustifyEnd,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"

// Dados da sua aplicação
const data = {
  teams: [
    {
      plan: "-",
      name: "SyncWave",
      logo: AlignHorizontalJustifyEnd,
    },
  ],
  navMain: [
    {
      title: "Início",
      url: "/",
      icon: Home,
      isActive: true,
    },
    {
      title: "Financeiro",
      url: "#",
      icon: Wallet,
      items: [
        {
          title: "Dashboard Financeiro",
          url: "/contas-pagar/dashboard",
        },
        {
          title: "Adicionar Contas a Pagar",
          url: "/contas-pagar",
        },
        {
          title: "Listar Contas a Pagar",
          url: "/contas-pagar/listar",
        },
      ],
    },
    // {
    //   title: "Clientes",
    //   url: "/clientes",
    //   icon: Users,
    // },
    // {
    //   title: "Configurações",
    //   url: "/configuracoes",
    //   icon: Settings2,
    // },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  // Dados do usuário vindos do contexto de autenticação
  const userData = {
    name: user?.full_name || user?.first_name || "Usuário",
    email: user?.email || "usuario@email.com",
    avatar: "/avatars/default.jpg",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}