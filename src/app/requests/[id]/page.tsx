import { use } from "react";
import { RequestDetailView } from "@/components/ui/RequestDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const { id } = use(params);
  
  return (
    <main className="min-h-screen bg-[#fafafa] p-8 md:p-20">
      <RequestDetailView id={id} />
    </main>
  );
}