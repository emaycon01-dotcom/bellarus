import {
  LayoutDashboard,
  FileText,
  CreditCard,
  History,
  HeadphonesIcon,
  ShieldCheck,
  Users,
  Crown,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import BellarusLogo from "./BellarusLogo";
import ThemeToggle from "./ThemeToggle";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const clientMenu = [
  { title: "Painel", url: "/dashboard", icon: LayoutDashboard },
  { title: "Documentos", url: "/dashboard/documents", icon: FileText },
  { title: "Recargas", url: "/dashboard/credits", icon: CreditCard },
  { title: "Histórico", url: "/dashboard/history", icon: History },
  { title: "Revendedores", url: "/dashboard/resellers", icon: Crown },
  { title: "Suporte", url: "/dashboard/support", icon: HeadphonesIcon },
];

const adminMenu = [
  { title: "Admin Painel", url: "/dashboard/admin", icon: ShieldCheck },
  { title: "Gerenciar Usuários", url: "/dashboard/admin/users", icon: Users },
  { title: "Financeiro", url: "/dashboard/admin/finance", icon: CreditCard },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  // Mock: in real app, check user role
  const isAdmin = true;

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="p-4 border-b border-sidebar-border">
        <BellarusLogo size={collapsed ? "sm" : "md"} showText={!collapsed} />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {clientMenu.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="sidebar-item"
                      activeClassName="active"
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
              Administração
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenu.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="sidebar-item"
                        activeClassName="active"
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 space-y-1">
        <ThemeToggle />
        <NavLink
          to="/login"
          className="sidebar-item text-destructive/80 hover:text-destructive"
          activeClassName=""
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </NavLink>
      </SidebarFooter>
    </Sidebar>
  );
}
