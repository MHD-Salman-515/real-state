import { useState } from "react";
import { useToast } from "@/components/ToastProvider.jsx";
import { ownerChatApi } from "@/services/ownerChat.api";
import PriceRecommendationForm from "@/components/owner-market-watch/PriceRecommendationForm";
import RecommendationResultCard from "@/components/owner-market-watch/RecommendationResultCard";
import SimilarMarketSignals from "@/components/owner-market-watch/SimilarMarketSignals";

export default function OwnerPriceRecommendationPanel() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, any> | null>(null);

  const handleSubmit = async (payload: {
    city: string;
    district: string;
    propertyType: string;
    area: number;
    bedrooms?: number;
    bathrooms?: number;
  }) => {
    setLoading(true);
    try {
      const data = await ownerChatApi.applyPriceAction(payload);
      setResult((data && typeof data === "object" ? data : { response: data }) as Record<string, any>);
      toast.success("Price recommendation generated.");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to generate recommendation.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <PriceRecommendationForm loading={loading} onSubmit={handleSubmit} />
      <div className="grid gap-4 xl:grid-cols-2">
        <RecommendationResultCard result={result} />
        <SimilarMarketSignals result={result} />
      </div>
    </section>
  );
}
