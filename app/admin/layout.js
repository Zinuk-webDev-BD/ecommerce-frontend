import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-6 flex flex-wrap gap-4 border-b pb-3 text-sm">
          <Link href="/admin" className="font-semibold hover:underline">
            Dashboard
          </Link>
          <Link href="/admin/orders" className="hover:underline">
            Orders
          </Link>
          <Link href="/admin/products" className="hover:underline">
            Products
          </Link>
          <Link href="/admin/categories" className="hover:underline">
            Categories
          </Link>
        </div>
        {children}
      </div>
    </AdminGuard>
  );
}