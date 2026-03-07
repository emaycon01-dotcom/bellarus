import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Credits from "./pages/Credits";
import DocumentHistory from "./pages/DocumentHistory";
import Resellers from "./pages/Resellers";
import ResellerPayment from "./pages/ResellerPayment";
import Support from "./pages/Support";
import AdminPanel from "./pages/AdminPanel";
import AdminUsers from "./pages/AdminUsers";
import AdminFinance from "./pages/AdminFinance";
import CnhForm from "./pages/CnhForm";
import NauticaForm from "./pages/NauticaForm";
import RgPdfForm from "./pages/RgPdfForm";
import CrlveForm from "./pages/CrlveForm";
import SantanderForm from "./pages/SantanderForm";
import RendaForm from "./pages/RendaForm";
import EstudanteForm from "./pages/EstudanteForm";
import AtestadoForm from "./pages/AtestadoForm";
import ReceitaForm from "./pages/ReceitaForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="documents" element={<Documents />} />
            <Route path="documents/cnh" element={<CnhForm />} />
            <Route path="documents/nautica" element={<NauticaForm />} />
            <Route path="documents/rg-pdf" element={<RgPdfForm />} />
            <Route path="documents/crlve" element={<CrlveForm />} />
            <Route path="documents/santander" element={<SantanderForm />} />
            <Route path="documents/renda" element={<RendaForm />} />
            <Route path="documents/estudante" element={<EstudanteForm />} />
            <Route path="documents/atestado" element={<AtestadoForm />} />
            <Route path="documents/receita" element={<ReceitaForm />} />
            <Route path="credits" element={<Credits />} />
            <Route path="history" element={<DocumentHistory />} />
            <Route path="resellers" element={<Resellers />} />
            <Route path="resellers/payment" element={<ResellerPayment />} />
            <Route path="support" element={<Support />} />
            <Route path="admin" element={<AdminPanel />} />
            <Route path="admin/users" element={<AdminUsers />} />
            <Route path="admin/finance" element={<AdminFinance />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
