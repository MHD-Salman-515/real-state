// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";

// 🟢 Providers
import { ToastProvider } from "./components/ToastProvider.jsx";

// ===== Error Boundary =====
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// ===== Guards =====
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RequireRole from "./components/RequireRole.jsx";

// ===== Layouts =====
import PublicLayout from "./layouts/PublicLayout.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import OwnerLayout from "./layouts/OwnerLayout.jsx";
import WorkerLayout from "./layouts/WorkerLayout.jsx";

// ===== Client pages =====
import Intro from "./pages/client/Intro.jsx";
import Home from "./pages/client/Home.jsx";
import HomeDemoWrapper from "./pages/home/HomeDemoWrapper.jsx";
import Search from "./pages/client/Search.jsx";
import Properties from "./pages/client/Properties.jsx";
import Services from "./pages/client/Services.jsx";
import About from "./pages/client/About.jsx";
import Contact from "./pages/client/Contact.jsx";
import PropertyDetails from "./pages/client/PropertyDetails.jsx";
import BookVisit from "./pages/client/BookVisit.jsx";
import Appointments from "./pages/client/Appointments.jsx";
import Favorites from "./pages/client/Favorites.jsx";
import Profile from "./pages/client/Profile.jsx";
import CreateTicket from "./pages/client/CreateTicket.jsx";
import Tickets from "./pages/client/Tickets.jsx";
import TicketDetails from "./pages/client/TicketDetails.jsx";
import Legal from "./pages/client/Legal.jsx";


// ===== Auth pages =====
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import OAuthCallback from "./pages/auth/OAuthCallback.jsx";

// ===== Owner pages =====
import OwnerDashboard from "./pages/owner/Dashboard.jsx";
import OwnerProperties from "./pages/owner/Properties.jsx";
import OwnerPropertyEdit from "./pages/owner/PropertyEdit.jsx";
import OwnerAppointments from "./pages/owner/Appointments.jsx";
import OwnerChatPage from "./pages/owner/OwnerChatPage";
import OwnerMarketWatchPage from "./pages/dashboard/owner/OwnerMarketWatchPage";
import OwnerDecisionSimulatorPage from "./pages/dashboard/owner/OwnerDecisionSimulatorPage";

// ===== Worker pages =====
import WorkerDashboard from "./pages/worker/WorkerDashboard.jsx";

// ===== Admin (non-lazy) =====
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminAppointments from "./pages/admin/Appointments.jsx";
import AdminProperties from "./pages/admin/Properties.jsx";
import AdminMaintenance from "./pages/admin/Maintenance.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import AdminCommissions from "./pages/admin/Commissions.jsx";
import AdminFinance from "./pages/admin/Finance.jsx";
import AdminAging from "./pages/admin/ARAging.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminOperations from "./pages/admin/Operations.jsx";
import AdminMarketRecoveryPage from "./pages/dashboard/admin/AdminMarketRecoveryPage";
import AdminIntelligenceMonitorPage from "./pages/dashboard/admin/AdminIntelligenceMonitorPage";
import AgentDashboard from "./pages/agent/Dashboard.jsx";
import AccountantDashboard from "./pages/accountant/Dashboard.jsx";

// ===== Agent (lazy) =====
const AgentLayout = lazy(() => import("./layouts/AgentLayout.jsx"));
const AgentAppointments = lazy(() => import("./pages/agent/Appointments.jsx"));
const AgentLinkOps = lazy(() => import("./pages/agent/LinkOps.jsx"));

// ===== Accountant (lazy) =====
const AccountantLayout = lazy(() => import("./layouts/AccountantLayout.jsx"));
const SalesInvoices = lazy(() => import("./pages/accountant/SalesInvoices.jsx"));
const RentInvoices = lazy(() => import("./pages/accountant/RentInvoices.jsx"));
const RecordPayments = lazy(() => import("./pages/accountant/RecordPayments.jsx"));
const SupplierInvoices = lazy(() => import("./pages/accountant/SupplierInvoices.jsx"));
const CostAllocation = lazy(() => import("./pages/accountant/CostAllocation.jsx"));
const AccountantIncome = lazy(() => import("./pages/accountant/Income.jsx"));
const AccountantAging = lazy(() => import("./pages/accountant/ARAging.jsx"));

// ===== Supplier (non-lazy) =====
import SupplierLayout from "./layouts/SupplierLayout.jsx";
import SupplierTasks from "./pages/supplier/AcceptAssignments.jsx";
import SupplierBills from "./pages/supplier/Bills.jsx";
import SupplierCostLink from "./pages/supplier/CostLink.jsx";

// ===== 404 =====
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

// ===== Loader =====
function PageLoader() {
  return (
    <div style={{ minHeight: "40vh", display: "grid", placeItems: "center" }}>
      <span>…جاري التحميل</span>
    </div>
  );
}

// ===== ScrollToTop =====
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
          <ScrollToTop />
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route element={<AppLayout />}>
                  {/* ===== Public + Client ===== */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomeDemoWrapper />} />
                    <Route path="/home" element={<HomeDemoWrapper />} />
                    <Route path="/home-old" element={<Home />} />
                    <Route path="/intro" element={<Intro />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/properties" element={<Properties />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/legal" element={<Legal />} />
                    <Route path="/property/:id" element={<PropertyDetails />} />
                    <Route path="/client/book-visit" element={<BookVisit />} />

                    {/* اختصارات */}
                    <Route path="/login" element={<Navigate to="/auth/login" replace />} />
                    <Route path="/register" element={<Navigate to="/auth/register" replace />} />

                    {/* صفحات تتطلب تسجيل دخول فقط (عميل مسجّل) */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/client/appointments" element={<Appointments />} />
                      <Route path="/client/favorites" element={<Favorites />} />
                      <Route path="/client/profile" element={<Profile />} />

                      {/* نظام التذاكر للعميل */}
                      <Route path="/property/:id/create-ticket" element={<CreateTicket />} />
                      <Route path="/client/tickets" element={<Tickets />} />
                      <Route path="/client/tickets/:id" element={<TicketDetails />} />
                    </Route>
                  </Route>

                  {/* ===== Starter Dashboards ===== */}
                  <Route element={<DashboardLayout />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/owner" element={<OwnerDashboard />} />
                    <Route path="/agent" element={<AgentDashboard />} />
                    <Route path="/accountant" element={<AccountantDashboard />} />
                  </Route>

                  {/* ===== Owner (يتطلب دور owner) ===== */}
                  <Route element={<RequireRole allow={["owner"]} fallback="/" />}>
                    <Route path="/owner" element={<OwnerLayout />}>
                      <Route index element={<Navigate to="properties" replace />} />
                      <Route path="dashboard" element={<OwnerDashboard />} />
                      <Route path="properties" element={<OwnerProperties />} />
                      <Route path="properties/new" element={<OwnerPropertyEdit />} />
                      <Route path="properties/:id/edit" element={<OwnerPropertyEdit />} />
                      <Route path="appointments" element={<OwnerAppointments />} />
                      <Route path="market-watch" element={<OwnerMarketWatchPage />} />
                      <Route path="decision-simulator" element={<OwnerDecisionSimulatorPage />} />
                      <Route path="chat" element={<OwnerChatPage />} />
                      <Route path="chat/:sessionId" element={<OwnerChatPage />} />
                    </Route>
                  </Route>

                  {/* ===== Worker (يتطلب دور worker) ===== */}
                  <Route element={<RequireRole allow={["worker"]} fallback="/" />}>
                    <Route path="/worker" element={<WorkerLayout />}>
                      <Route index element={<WorkerDashboard />} />
                    </Route>
                  </Route>

                  {/* ===== Admin (يتطلب دور admin) ===== */}
                  <Route element={<RequireRole allow={["admin"]} fallback="/" />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Navigate to="appointments" replace />} />
                      <Route path="appointments" element={<AdminAppointments />} />
                      <Route path="properties" element={<AdminProperties />} />
                      <Route path="maintenance" element={<AdminMaintenance />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="commissions" element={<AdminCommissions />} />
                      <Route path="finance" element={<AdminFinance />} />
                      <Route path="aging" element={<AdminAging />} />
                      <Route path="operations" element={<AdminOperations />} />
                      <Route path="market-recovery" element={<AdminMarketRecoveryPage />} />
                      <Route path="intelligence-monitor" element={<AdminIntelligenceMonitorPage />} />
                    </Route>
                  </Route>

                  {/* ===== Agent (يتطلب دور agent) ===== */}
                  <Route element={<RequireRole allow={["agent"]} fallback="/" />}>
                    <Route path="/agent" element={<AgentLayout />}>
                      {/* أول ما يدخل /agent يروح على المواعيد */}
                      <Route index element={<Navigate to="appointments" replace />} />
                      <Route path="appointments" element={<AgentAppointments />} />
                      <Route path="link-ops" element={<AgentLinkOps />} />
                    </Route>
                  </Route>

                  {/* ===== Accountant (يتطلب دور accountant) ===== */}
                  <Route element={<RequireRole allow={["accountant"]} fallback="/" />}>
                    <Route path="/accountant" element={<AccountantLayout />}>
                      <Route index element={<Navigate to="sales-invoices" replace />} />
                      <Route path="sales-invoices" element={<SalesInvoices />} />
                      <Route path="rent-invoices" element={<RentInvoices />} />
                      <Route path="record-payments" element={<RecordPayments />} />
                      <Route path="supplier-invoices" element={<SupplierInvoices />} />
                      <Route path="cost-allocation" element={<CostAllocation />} />
                      <Route path="income" element={<AccountantIncome />} />
                      <Route path="aging" element={<AccountantAging />} />
                    </Route>
                  </Route>

                  {/* ===== Supplier (يتطلب دور supplier) ===== */}
                  <Route element={<RequireRole allow={["supplier"]} fallback="/" />}>
                    <Route path="/supplier" element={<SupplierLayout />}>
                      <Route index element={<Navigate to="tasks" replace />} />
                      <Route path="tasks" element={<SupplierTasks />} />
                      <Route path="bills" element={<SupplierBills />} />
                      <Route path="cost-link" element={<SupplierCostLink />} />
                    </Route>
                  </Route>

                  {/* ===== 404 ===== */}
                  <Route path="*" element={<NotFound />} />
                </Route>

                <Route element={<AuthLayout />}>
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="/auth/register" element={<Register />} />
                  <Route path="/auth/oauth/callback" element={<OAuthCallback />} />
                </Route>
              </Routes>
            </Suspense>
          </ErrorBoundary>
      </BrowserRouter>
    </ToastProvider>
  );
}
