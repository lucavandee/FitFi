import { Helmet } from "react-helmet-async";
import NovaChat from "@/components/ai/NovaChat";

export default function NovaPage() {
  return (
    <div className="grid gap-6">
      <Helmet><title>Nova — FitFi</title></Helmet>
      <NovaChat />
    </div>
  );
}