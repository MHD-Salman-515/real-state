import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useToast } from "../../components/ToastProvider";

export default function SupplierInvoices() {
  const toast = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/expenses/supplier", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("auth_token_v1"),
          },
        });

        setData(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("فشل تحميل فواتير الموردين");
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-white">...جاري التحميل</div>;
  }

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-semibold mb-6">فواتير الموردين</h2>

      {data.length === 0 ? (
        <p className="text-gray-300">لا يوجد فواتير للموردين.</p>
      ) : (
        <div className="space-y-6">
          {data.map((item) => (
            <div
              key={item.id}
              className="border border-white/10 p-6 rounded-xl bg-white/5 backdrop-blur-sm shadow-lg"
            >
              {/* الفاتورة */}
              <div className="mb-3">
                <h3 className="font-bold text-lg">
                  فاتورة رقم: {item.invoice?.id}
                </h3>
                <p className="text-gray-200">نوع الفاتورة: {item.invoice?.type}</p>
                <p className="text-gray-200">المبلغ: {item.amount} ل.س</p>
                <p className="text-gray-200">الحالة: {item.invoice?.status}</p>
              </div>

              <hr className="border-white/10 my-3" />

              {/* المورد */}
              <div className="mb-3">
                <h4 className="font-semibold text-lg">المورد</h4>
                <p className="text-gray-200">{item.contractor?.fullName}</p>
                <p className="text-gray-200">{item.contractor?.email}</p>
              </div>

              <hr className="border-white/10 my-3" />

              {/* التذكرة */}
              <div className="mb-3">
                <h4 className="font-semibold text-lg">التذكرة</h4>
                <p className="text-gray-200">
                  الوصف: {item.ticket?.description}
                </p>
                <p className="text-gray-200">
                  الأولوية: {item.ticket?.priority}
                </p>
                <p className="text-gray-200">الحالة: {item.ticket?.status}</p>
              </div>

              <hr className="border-white/10 my-3" />

              {/* العقار */}
              <div>
                <h4 className="font-semibold text-lg">العقار</h4>
                <p className="text-gray-200">{item.ticket?.property?.title}</p>
                <p className="text-gray-200">
                  {item.ticket?.property?.address}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
