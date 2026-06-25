import { getCards } from "@/lib/data";
import CompanyGrid from "@/components/CompanyGrid";

export default function Page() {
  return <CompanyGrid cards={getCards()} />;
}
