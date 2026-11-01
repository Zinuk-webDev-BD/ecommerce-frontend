import { Suspense } from "react";
import AdminProductEdit from "@/components/AdminProductEdit";

// reads the id from the url, then shows the edit component
async function Content({ params }) {
  const { id } = await params;
  return <AdminProductEdit id={id} />;
}

// Suspense is used so the page also builds correctly when we deploy
export default function EditProductPage({ params }) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Content params={params} />
    </Suspense>
  );
}