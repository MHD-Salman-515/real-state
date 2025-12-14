import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }

  static getDerivedStateFromError(err) {
    return { err };
  }

  componentDidCatch(err, info) {
    console.error("⚠️ Error Boundary Caught:", { err, info });
  }

  render() {
    if (this.state.err) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0F14] relative overflow-hidden">

          {/* خلفيات مضيئة مثل باقي المشروع */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-28 -left-28 h-64 w-64 rounded-full bg-red-500/20 blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl animate-pulse" />
          </div>

          {/* الكرت الرئيسي */}
          <div
            className="
              relative z-10 p-8 max-w-lg w-full rounded-3xl
              bg-white/10 backdrop-blur-xl 
              border border-white/20 
              shadow-2xl shadow-emerald-500/25 
              animate-slide-up
            "
          >
            <h2 className="
                text-2xl font-black mb-3 
                bg-gradient-to-r from-red-300 via-amber-300 to-yellow-300
                bg-clip-text text-transparent
              ">
              حدث خطأ غير متوقع
            </h2>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              تم تسجيل تفاصيل الخطأ في الـ Console.  
              <br />
              يرجى إعادة تحميل الصفحة أو متابعة ما تقوم به لاحقًا.
            </p>

            <button
              onClick={() => location.reload()}
              className="
                px-5 py-2.5 rounded-xl 
                bg-gradient-to-r from-emerald-500 to-cyan-500 
                shadow-lg shadow-emerald-500/40
                text-black font-semibold 
                hover:scale-105 transition
              "
            >
              إعادة تحميل الصفحة
            </button>
          </div>

        </div>
      );
    }

    return this.props.children;
  }
}
