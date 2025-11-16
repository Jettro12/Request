import { Suspense } from "react";
import Header from "@/components/Header";
import SearchContent from "./SearchContent";

export default function SearchPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <Suspense
          fallback={
            <div className="max-w-6xl mx-auto px-4 py-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Resultados de búsqueda
                </h1>
              </div>
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Cargando búsqueda...</p>
              </div>
            </div>
          }
        >
          <SearchContent />
        </Suspense>
      </main>
    </>
  );
}
