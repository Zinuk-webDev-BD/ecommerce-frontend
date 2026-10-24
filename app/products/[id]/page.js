import { Suspense } from "react";
import ProductDetail from "@/components/ProductDetail";

// reads the id from the url, then shows the detail component
async function Content({ params }) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}

// Suspense is used so the page also builds correctly when we deploy
export default function ProductPage({ params }) {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <Content params={params} />
    </Suspense>
  );
}