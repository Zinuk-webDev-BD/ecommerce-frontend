// small colored label for order and payment status
const colors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export default function StatusBadge({ value }) {
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-semibold capitalize ${
        colors[value] || "bg-gray-100 text-gray-800"
      }`}
    >
      {value}
    </span>
  );
}