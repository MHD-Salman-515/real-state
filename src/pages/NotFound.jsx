import { Link } from "react-router-dom";
export default function NotFound(){
  return (
    <div className="section py-10">
      <div className="card p-8 text-center">
        <div className="mx-auto h-12 w-12 rounded-full border border-white/15 bg-white/10 mb-3" />
        <h1 className="text-xl font-bold mb-1">الصفحة غير موجودة</h1>
        <p className="text-sm text-ink/70 mb-4">تحقق من العنوان أو ارجع للرئيسية.</p>
        <Link className="btn-primary" to="/">العودة للرئيسية</Link>
      </div>
    </div>
  );
}
