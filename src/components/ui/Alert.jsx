export default function Alert({ variant = "info", children }) {
  const styles =
    variant === "success"
      ? "bg-green-50 text-green-800 ring-green-200"
      : variant === "error"
        ? "bg-red-50 text-red-800 ring-red-200"
        : "bg-gray-50 text-gray-800 ring-gray-200";
  return (
    <div className={`rounded-xl px-4 py-3 text-sm ring-1 ${styles}`}>
      {children}
    </div>
  );
}
