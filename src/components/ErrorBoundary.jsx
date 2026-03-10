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
          {/* الكرت الرئيسي */}
          <div
            className="
              relative z-10 p-8 max-w-lg w-full rounded-3xl
              bg-white/10 backdrop-blur-xl 
              border border-white/20 
              shadow-2xl shadow-white/10 
              animate-slide-up
            "
          >
            <h2 className="
                text-2xl font-black mb-3 
                bg-gradient-to-r from-red-300 via-white/10 to-white/10
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
                bg-gradient-to-r from-white/20 to-white/10 
                shadow-lg shadow-white/10
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
