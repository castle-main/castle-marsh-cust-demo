import { notFound } from "next/navigation";
import { getCompanyView, getAllSlugs } from "@/lib/data";
import CompanyDetail from "@/components/CompanyDetail";

export function generateStaticParams() {
  return getAllSlugs().map((id) => ({ id }));
}

export default function Page({ params }: { params: { id: string } }) {
  const co = getCompanyView(params.id);
  if (!co) notFound();
  return <CompanyDetail co={co} />;
}
