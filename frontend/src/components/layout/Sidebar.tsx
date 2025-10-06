import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import {
  AlignHorizontalJustifyEnd,
  Home,
  LogOut,
  Package,
  PanelBottom,
  Settings2,
  Users,
  Wallet,
  FileText,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* ===== DESKTOP: Sidebar Vertical com Ícones ===== */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 border-r bg-background sm:flex flex-col">
        <nav className="flex flex-col items-center gap-4 px-2 py-5">
          <TooltipProvider delayDuration={50}>
            {/* Logo */}
            <Link
              to="/"
              className="flex h-9 w-9 shrink-0 items-center justify-center bg-primary text-primary-foreground rounded-full"
            >
              <AlignHorizontalJustifyEnd className="h-4 w-4" />
              <span className="sr-only">SyncWave</span>
            </Link>

            {/* Início */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  <span className="sr-only">Início</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12}>
                Início
              </TooltipContent>
            </Tooltip>

            {/* Financeiro com Submenu */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground">
                      <Wallet className="h-5 w-5" />
                      <span className="sr-only">Financeiro</span>
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12}>
                  Financeiro
                </TooltipContent>
              </Tooltip>

              <DropdownMenuContent
                side="right"
                align="start"
                sideOffset={12}
                className="w-48"
              >
                <DropdownMenuLabel>Financeiro</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/financeiro/dashboard" className="flex items-center gap-2 cursor-pointer">
                    <TrendingUp className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/financeiro/receitas" className="flex items-center gap-2 cursor-pointer">
                    <DollarSign className="h-4 w-4" />
                    Receitas
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/financeiro/despesas" className="flex items-center gap-2 cursor-pointer">
                    <DollarSign className="h-4 w-4" />
                    Despesas
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/financeiro/relatorios" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4" />
                    Relatórios
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clientes */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/clientes"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Users className="h-5 w-5" />
                  <span className="sr-only">Clientes</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12}>
                Clientes
              </TooltipContent>
            </Tooltip>

            {/* Configurações */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/configuracoes"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Settings2 className="h-5 w-5" />
                  <span className="sr-only">Configurações</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12}>
                Configurações
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>

        <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-5">
          <TooltipProvider delayDuration={50}>
            {/* Sair */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-destructive/10"
                >
                  <LogOut className="h-5 w-5 text-destructive" />
                  <span className="sr-only">Sair</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12}>
                Sair
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>

      {/* ===== MOBILE: Sheet Menu ===== */}
      <div className="sm:hidden flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center px-4 border-b bg-background gap-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelBottom className="w-5 h-5" />
                <span className="sr-only">Abrir / Fechar menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                {/* Logo */}
                <Link
                  to="/"
                  className="flex h-10 w-10 bg-primary rounded-full text-lg items-center justify-center text-primary-foreground md:text-base gap-2"
                >
                  <Package className="h-5 w-5 transition-all" />
                  <span className="sr-only">SyncWave</span>
                </Link>

                {/* Início */}
                <Link
                  to="/"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5 transition-all" />
                  Início
                </Link>

                {/* Financeiro com submenu */}
                <div className="space-y-2">
                  <div className="flex items-center gap-4 px-2.5 text-muted-foreground font-medium">
                    <Wallet className="h-5 w-5" />
                    Financeiro
                  </div>
                  <div className="ml-9 space-y-2 border-l-2 border-border pl-4">
                    <Link
                      to="/financeiro/dashboard"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/financeiro/receitas"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      Receitas
                    </Link>
                    <Link
                      to="/financeiro/despesas"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      Despesas
                    </Link>
                    <Link
                      to="/financeiro/relatorios"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      Relatórios
                    </Link>
                  </div>
                </div>

                {/* Clientes */}
                <Link
                  to="/clientes"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Users className="h-5 w-5 transition-all" />
                  Clientes
                </Link>

                {/* Configurações */}
                <Link
                  to="/configuracoes"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Settings2 className="h-5 w-5 transition-all" />
                  Configurações
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <h2 className="text-lg font-semibold">Menu</h2>
        </header>
      </div>
    </>
  );
}