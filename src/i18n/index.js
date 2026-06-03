import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ar: {
    translation: {
      // Navigation
      "Properties": "العقارات",
      "Search": "البحث",
      "Dashboard": "لوحة التحكم",
      "Register": "إنشاء حساب",
      "Log in": "تسجيل الدخول",
      "Logout": "تسجيل الخروج",
      "Settings": "الإعدادات",
      "Profile": "الملف الشخصي",
      "Back to Site": "العودة للموقع",
      // Auth
      "Email and password are required.": "البريد الإلكتروني وكلمة المرور مطلوبان.",
      "Unable to sign in. Please check your credentials.": "تعذر تسجيل الدخول. تحقق من بياناتك.",
      "Welcome back": "مرحباً بعودتك",
      "Signed in as": "تم تسجيل الدخول بصفة",
      "Session secured": "تم تأمين الجلسة",
      "You are signed in successfully.": "تم تسجيل دخولك بنجاح.",
      // Accountant
      "Sales Invoices": "فواتير المبيعات",
      "Rent Invoices": "فواتير الإيجار",
      "Record Payments": "تسجيل المدفوعات",
      "Supplier Invoices": "فواتير الموردين",
      "Cost Allocation": "توزيع التكاليف",
      "Income": "الإيرادات",
      "A/R Aging": "تقادم الحسابات",
      "Expenses": "المصروفات",
      "Accounting": "المحاسبة",
      "Finance Console": "لوحة المالية",
      "CREOS Accountant": "كريوس - المحاسبة",
      "User:": "المستخدم:",
      // Roles
      "owner": "مالك",
      "admin": "مدير",
      "accountant": "محاسب",
      "agent": "وكيل",
      "client": "عميل",
      "supplier": "مورد",
      "worker": "فني",
      "guest": "زائر",
      // Owner
      "My Properties": "عقاراتي",
      "My Bookings": "حجوزاتي",
      "Owner Dashboard": "لوحة المالك",
      "Admin Dashboard": "لوحة المدير",
      "Accountant Dashboard": "لوحة المحاسب",
      "Supplier Dashboard": "لوحة المورد",
      "Worker Dashboard": "لوحة الفني",
      "Agent Dashboard": "لوحة الوكيل",
      // Client
      "Favorites": "المفضلة",
      "AI Search": "مساعد البحث",
      "Search History": "سجل البحث",
      "Saved Searches": "البحوثات المحفوظة",
      // Notifications
      "Notifications": "الإشعارات",
      "No notifications": "لا توجد إشعارات",
      "Clear": "مسح",
      "Close": "إغلاق",
      "Open": "فتح",
      "New accounting notification": "إشعار محاسبي جديد",
      // Common
      "Loading...": "جاري التحميل...",
      "Save": "حفظ",
      "Cancel": "إلغاء",
      "Delete": "حذف",
      "Edit": "تعديل",
      "Add": "إضافة",
      "Search...": "بحث...",
      "No data": "لا توجد بيانات",
      "Error": "خطأ",
      "Success": "تم بنجاح",
    }
  },
  en: {
    translation: {
      // Navigation
      "Properties": "Properties",
      "Search": "Search",
      "Dashboard": "Dashboard",
      "Register": "Register",
      "Log in": "Log in",
      "Logout": "Logout",
      "Settings": "Settings",
      "Profile": "Profile",
      "Back to Site": "Back to Site",
      // Auth
      "Email and password are required.": "Email and password are required.",
      "Unable to sign in. Please check your credentials.": "Unable to sign in. Please check your credentials.",
      "Welcome back": "Welcome back",
      "Signed in as": "Signed in as",
      "Session secured": "Session secured",
      "You are signed in successfully.": "You are signed in successfully.",
      // Accountant
      "Sales Invoices": "Sales Invoices",
      "Rent Invoices": "Rent Invoices",
      "Record Payments": "Record Payments",
      "Supplier Invoices": "Supplier Invoices",
      "Cost Allocation": "Cost Allocation",
      "Income": "Income",
      "A/R Aging": "A/R Aging",
      "Expenses": "Expenses",
      "Accounting": "Accounting",
      "Finance Console": "Finance Console",
      "CREOS Accountant": "CREOS Accountant",
      "User:": "User:",
      // Roles
      "owner": "Owner",
      "admin": "Admin",
      "accountant": "Accountant",
      "agent": "Agent",
      "client": "Client",
      "supplier": "Supplier",
      "worker": "Worker",
      "guest": "Guest",
      // Owner
      "My Properties": "My Properties",
      "My Bookings": "My Bookings",
      "Owner Dashboard": "Owner Dashboard",
      "Admin Dashboard": "Admin Dashboard",
      "Accountant Dashboard": "Accountant Dashboard",
      "Supplier Dashboard": "Supplier Dashboard",
      "Worker Dashboard": "Worker Dashboard",
      "Agent Dashboard": "Agent Dashboard",
      // Client
      "Favorites": "Favorites",
      "AI Search": "AI Search",
      "Search History": "Search History",
      "Saved Searches": "Saved Searches",
      // Notifications
      "Notifications": "Notifications",
      "No notifications": "No notifications",
      "Clear": "Clear",
      "Close": "Close",
      "Open": "Open",
      "New accounting notification": "New accounting notification",
      // Common
      "Loading...": "Loading...",
      "Save": "Save",
      "Cancel": "Cancel",
      "Delete": "Delete",
      "Edit": "Edit",
      "Add": "Add",
      "Search...": "Search...",
      "No data": "No data",
      "Error": "Error",
      "Success": "Success",
    }
  }
};

const savedLang = localStorage.getItem('creos_lang') || 'ar';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'ar',
    interpolation: { escapeValue: false },
  });

export default i18n;
