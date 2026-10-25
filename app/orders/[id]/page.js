import { Suspense } from "react";
import OrderDetail from "@/components/OrderDetail";

// reads the id and the ?payment= value from the url
async function Content({ params, searchParams }) {
  const { id } = await params;
  const { payment } = await searchParams;
  return <OrderDetail id={id} payment={payment || ""} />;
}

// Suspense is used so the page also builds correctly when we deploy
export default function OrderPage({ params, searchParams }) {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <Content params={params} searchParams={searchParams} />
    </Suspense>
  );
}