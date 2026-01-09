import { Suspense } from "react";
import Header from "@/components/Header";
import SearchClient from "./search-client";

export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="p-8">Cargando búsqueda...</div>}>
        <SearchClient />
      </Suspense>
    </>
  );
}
