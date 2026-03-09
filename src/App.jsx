import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RequireLogin, RequireArea } from './components/RouteGuard'
import ComingSoon from './components/ComingSoon'

import LoginPage        from './pages/LoginPage'
import AreaSelectorPage from './pages/AreaSelectorPage'
import DashboardLayout  from './pages/DashboardLayout'
import { SocialDashboard } from './pages/DashboardHomePage'

// Fase 2 — Diseño Gráfico
import DisenoDashboardPage from './pages/diseno/DisenoDashboardPage'
import DisenoIngresarPage  from './pages/diseno/DisenoIngresarPage'
import DisenoCompararPage  from './pages/diseno/DisenoCompararPage'

// Fase 3 — Sistemas / Web
import SistemasDashboardPage from './pages/sistemas/SistemasDashboardPage'
import SistemasIngresarPage  from './pages/sistemas/SistemasIngresarPage'
import SistemasCompararPage  from './pages/sistemas/SistemasCompararPage'

// Fase 4 — Gerencia
import GerenciaDashboardPage from './pages/gerencia/GerenciaDashboardPage'
import GerenciaJornadasPage  from './pages/gerencia/GerenciaJornadasPage'
import GerenciaGananciasPage from './pages/gerencia/GerenciaGananciasPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/areas" element={<RequireLogin><AreaSelectorPage /></RequireLogin>} />

          <Route path="/dashboard" element={<RequireArea><DashboardLayout /></RequireArea>}>

            {/* Social Media — Fase 5 */}
            <Route path="social" element={<SocialDashboard />} />
            <Route path="social/ingresar" element={<ComingSoon title="Ingreso Social Media" description="Formulario de métricas mensuales de Instagram — próximamente." />} />
            <Route path="social/campanas"  element={<ComingSoon title="Campañas publicitarias" description="Registro de campañas con CTR, gasto y conversiones — próximamente." />} />
            <Route path="social/comparar"  element={<ComingSoon title="Comparativa Social" description="Comparación mes a mes de Instagram — próximamente." />} />

            {/* Diseño Gráfico ✅ */}
            <Route path="diseno"           element={<DisenoDashboardPage />} />
            <Route path="diseno/ingresar"  element={<DisenoIngresarPage />} />
            <Route path="diseno/comparar"  element={<DisenoCompararPage />} />

            {/* Sistemas / Web ✅ */}
            <Route path="sistemas"           element={<SistemasDashboardPage />} />
            <Route path="sistemas/ingresar"  element={<SistemasIngresarPage />} />
            <Route path="sistemas/ga4"       element={<SistemasIngresarPage />} />
            <Route path="sistemas/comparar"  element={<SistemasCompararPage />} />

            {/* Gerencia ✅ */}
            <Route path="gerencia"             element={<GerenciaDashboardPage />} />
            <Route path="gerencia/jornadas"    element={<GerenciaJornadasPage />} />
            <Route path="gerencia/ganancias"   element={<GerenciaGananciasPage />} />
            <Route path="gerencia/comparar"    element={<ComingSoon title="Comparativa ejecutiva" description="Comparación de ingresos y jornadas mes a mes — próximamente." />} />

          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
