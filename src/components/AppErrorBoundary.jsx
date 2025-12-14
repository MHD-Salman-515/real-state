import { Component } from "react";

export default class AppErrorBoundary extends Component {
  constructor(p) {
    super(p);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0F14] relative overflow-hidden">

          {/* خلفيات مضيئة مثل باقي الموقع */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-red-500/20 blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl animate-pulse" />
          </div>

          {/* كرت الخطأ */}
          <div
            className="
              relative z-10 p-8 rounded-3xl 
              bg-white/10 backdrop-blur-xl 
              border border-white/20 shadow-2xl shadow-red-500/20 
              max-w-lg w-full text-center animate-slide-up
            "
          >
            <h1 className="text-2xl font-black bg-gradient-to-r from-red-300 via-amber-300 to-yellow-300 bg-clip-text text-transparent mb-4">
              حدث خطأ غير متوقع
            </h1>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              {String(this.state.error?.message || this.state.error)}
            </p>

            <button
              className="
                px-5 py-2.5 rounded-xl 
                bg-gradient-to-r from-emerald-500 to-cyan-500 
                shadow-lg shadow-emerald-500/30 
                text-black font-semibold hover:scale-105 transition
              "
              onClick={() => location.reload()}
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
