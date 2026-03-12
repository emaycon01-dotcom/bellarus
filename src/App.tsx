import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
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
import CinForm from "./pages/CinForm";
import ResidenciaForm from "./pages/ResidenciaForm";
import CertidaoNascimentoForm from "./pages/CertidaoNascimentoForm";
import CertidaoCasamentoForm from "./pages/CertidaoCasamentoForm";
import EsimForm from "./pages/EsimForm";
import DiplomaForm from "./pages/DiplomaForm";
import CertificadoEscolarForm from "./pages/CertificadoEscolarForm";
import DeclaracaoEscolarForm from "./pages/DeclaracaoEscolarForm";
import HistoricoEscolarForm from "./pages/HistoricoEscolarForm";
import DocumentVerification from "./pages/DocumentVerification";
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
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
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
            <Route path="documents/cin" element={<CinForm />} />
            <Route path="documents/residencia" element={<ResidenciaForm />} />
            <Route path="documents/certidao-nascimento" element={<CertidaoNascimentoForm />} />
            <Route path="documents/certidao-casamento" element={<CertidaoCasamentoForm />} />
            <Route path="documents/esim" element={<EsimForm />} />
            <Route path="documents/diploma" element={<DiplomaForm />} />
            <Route path="documents/certificado-escolar" element={<CertificadoEscolarForm />} />
            <Route path="documents/declaracao-escolar" element={<DeclaracaoEscolarForm />} />
            <Route path="documents/historico-escolar" element={<HistoricoEscolarForm />} />
            <Route path="credits" element={<Credits />} />
            <Route path="history" element={<DocumentHistory />} />
            <Route path="resellers" element={<Resellers />} />
            <Route path="resellers/payment" element={<ResellerPayment />} />
            <Route path="support" element={<Support />} />
            <Route path="admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="admin/finance" element={<AdminRoute><AdminFinance /></AdminRoute>} />
          </Route>
          <Route path="/verificar/:id" element={<DocumentVerification />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
