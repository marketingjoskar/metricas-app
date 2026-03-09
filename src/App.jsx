import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RequireLogin, RequireArea } from './components/RouteGuard'
import ComingSoon from './components/ComingSoon'

import LoginPage        from './pages/LoginPage'
import AreaSelectorPage from './pages/AreaSelectorPage'
import DashboardLayout  from './pages/DashboardLayout'
import { SocialDashboard, GerenciaDashboard } from './pages/DashboardHomePage'

// ✅ Fase 2 — Diseño Gráfico
import DisenoDashboardPage from './pages/diseno/DisenoDashboardPage'
import DisenoIngresarPage  from './pages/diseno/DisenoIngresarPage'
import DisenoCompararPage  from './pages/diseno/DisenoCompararPage'

// ✅ Fase 3 — Sistemas / Web
import SistemasDashboardPage from './pages/sistemas/SistemasDashboardPage'
import SistemasIngresarPage  from './pages/sistemas/SistemasIngresarPage'
import SistemasCompararPage  from './pages/sistemas/SistemasCompararPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/areas" element={<RequireLogin><AreaSelectorPage /></RequireLogin>} />

          <Route path="/dashboard" element={<RequireArea><DashboardLayout /></RequireArea>}>

            {/* Social Media — Fase 4 */}
            <Route path="social" element={<SocialDashboard />} />
            <Route path="social/ingresar" element={<ComingSoon title="Ingreso de métricas" description="Formulario de ingreso mensual de Social Media — Fase 4." />} />
            <Route path="social/campanas" element={<ComingSoon title="Campañas publicitarias" description="Registro manual de campañas con CTR, gasto y conversiones — Fase 4." />} />
            <Route path="social/comparar" element={<ComingSoon title="Comparativa mensual" description="Comparación mes a mes de todas las métricas de Instagram — Fase 4." />} />

            {/* ✅ Diseño Gráfico — Fase 2 */}
            <Route path="diseno"          element={<DisenoDashboardPage />} />
            <Route path="diseno/ingresar" element={<DisenoIngresarPage />} />
            <Route path="diseno/comparar" element={<DisenoCompararPage />} />

            {/* ✅ Sistemas / Web — Fase 3 */}
            <Route path="sistemas"          element={<SistemasDashboardPage />} />
            <Route path="sistemas/ingresar" element={<SistemasIngresarPage />} />
            <Route path="sistemas/ga4"      element={<SistemasIngresarPage />} />
            <Route path="sistemas/comparar" element={<SistemasCompararPage />} />

            {/* Gerencia — Fase 4 */}
            <Route path="gerencia" element={<GerenciaDashboard />} />
            <Route path="gerencia/jornadas"  element={<ComingSoon title="Jornadas médicas" description="Fase 4." />} />
            <Route path="gerencia/ganancias" element={<ComingSoon title="Ganancias / Excel" description="Fase 4." />} />
            <Route path="gerencia/comparar"  element={<ComingSoon title="Comparativa ejecutiva" description="Fase 4." />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
