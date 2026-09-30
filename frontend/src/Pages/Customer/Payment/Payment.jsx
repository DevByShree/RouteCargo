import { useState, useMemo } from "react";

const PAGE_SIZE = 8;

const transactions = [
    { id: 1, date: "22 Sep 2026", time: "04:35 PM", month: "2026-09", bookingId: "#SH00123", from: "Pune", to: "Mumbai", load: "2 Ton", cargo: "Electronics", amount: 8500, method: "Google Pay", status: "completed" },
    { id: 2, date: "18 Sep 2026", time: "11:20 AM", month: "2026-09", bookingId: "#SH00120", from: "Mumbai", to: "Nashik", load: "1.5 Ton", cargo: "Machinery", amount: 12000, method: "Credit Card", status: "completed" },
    { id: 3, date: "12 Sep 2026", time: "09:15 AM", month: "2026-09", bookingId: "#SH00118", from: "Pune", to: "Ahmedabad", load: "0.8 Ton", cargo: "Packaging", amount: 6200, method: "PhonePe", status: "pending" },
    { id: 4, date: "05 Sep 2026", time: "06:40 PM", month: "2026-09", bookingId: "#SH00115", from: "Nashik", to: "Indore", load: "1.2 Ton", cargo: "Food Products", amount: 15000, method: "Net Banking", status: "completed" },
    { id: 5, date: "28 Aug 2026", time: "10:10 AM", month: "2026-08", bookingId: "#SH00112", from: "Mumbai", to: "Bengaluru", load: "2.5 Ton", cargo: "Auto Parts", amount: 4800, method: "Wallet", status: "refunded" },
    { id: 6, date: "20 Aug 2026", time: "02:15 PM", month: "2026-08", bookingId: "#SH00110", from: "Pune", to: "Delhi", load: "1 Ton", cargo: "Documents", amount: 1750, method: "UPI", status: "completed" },
    { id: 7, date: "14 Aug 2026", time: "08:30 AM", month: "2026-08", bookingId: "#SH00108", from: "Nagpur", to: "Mumbai", load: "3 Ton", cargo: "Construction", amount: 9500, method: "Credit Card", status: "pending" },
    { id: 8, date: "05 Aug 2026", time: "05:45 PM", month: "2026-08", bookingId: "#SH00105", from: "Mumbai", to: "Jaipur", load: "1.8 Ton", cargo: "Textiles", amount: 7200, method: "Net Banking", status: "completed" },
];

// Top cards - real app mein ye API se aayenge
const stats = [
    { label: "Total Spent", value: "₹ 48,250", sub: "↑ 12% from last month", bg: "bg-blue-50", iconBg: "bg-blue-100 text-blue-600", labelColor: "text-blue-700", subColor: "text-green-600", icon: "₹" },
    { label: "Completed Payments", value: "12", sub: "↑ 20% from last month", bg: "bg-green-50", iconBg: "bg-green-100 text-green-600", labelColor: "text-gray-800", subColor: "text-green-600", icon: "✓" },
    { label: "Pending Payments", value: "2", sub: "₹ 9,500 pending", bg: "bg-orange-50", iconBg: "bg-orange-100 text-orange-500", labelColor: "text-gray-800", subColor: "text-orange-500", icon: "◷" },
    { label: "Refunds", value: "1", sub: "₹ 1,200 refunded", bg: "bg-purple-50", iconBg: "bg-purple-100 text-purple-600", labelColor: "text-gray-800", subColor: "text-purple-600", icon: "↺" },
];

const tabs = [
    { id: "all", label: "All Transactions" },
    { id: "completed", label: "Completed" },
    { id: "pending", label: "Pending" },
    { id: "refunded", label: "Refunds" },
];

const statusStyle = {
    completed: { label: "Completed", cls: "bg-green-100 text-green-700" },
    pending: { label: "Pending", cls: "bg-orange-100 text-orange-600" },
    refunded: { label: "Refunded", cls: "bg-red-100 text-red-600" },
};

const methodBadge = {
    "Google Pay": "bg-gray-100 text-gray-700",
    "Credit Card": "bg-blue-100 text-blue-700",
    PhonePe: "bg-purple-100 text-purple-700",
    "Net Banking": "bg-indigo-100 text-indigo-700",
    Wallet: "bg-sky-100 text-sky-700",
    UPI: "bg-emerald-100 text-emerald-700",
};

const methods = [...new Set(transactions.map((t) => t.method))];
const months = [
    { id: "2026-09", label: "Sep 2026" },
    { id: "2026-08", label: "Aug 2026" },
];

const formatINR = (n) => "₹ " + n.toLocaleString("en-IN");

function Payments() {
    const [activeTab, setActiveTab] = useState("all");
    const [month, setMonth] = useState("all");
    const [method, setMethod] = useState("all");
    const [page, setPage] = useState(1);

    const filtered = useMemo(
        () =>
            transactions.filter(
                (t) =>
                    (activeTab === "all" || t.status === activeTab) &&
                    (month === "all" || t.month === month) &&
                    (method === "all" || t.method === method)
            ),
        [activeTab, month, method]
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const rows = filtered.slice(start, start + PAGE_SIZE);

    // filter badalne par page 1 par wapas
    const withReset = (setter) => (e) => {
        setter(e.target ? e.target.value : e);
        setPage(1);
    };

    const downloadCSV = () => {
        const header = ["Date", "Time", "Booking ID", "Route", "Load", "Cargo", "Amount", "Method", "Status"];
        const lines = filtered.map((t) =>
            [t.date, t.time, t.bookingId, `${t.from} to ${t.to}`, t.load, t.cargo, t.amount, t.method, t.status].join(",")
        );
        const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "transactions.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleInvoice = (t) => {
        // TODO: yahan invoice PDF ka API call / link lagao
        console.log("Download invoice for", t.bookingId);
    };

    return (
        <div className="px-10 mt-10 pb-10">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900">Payments</h1>
                    <p className="text-gray-600 mt-1">View your transactions, invoices and payment status.</p>
                </div>
                <div className="flex items-center gap-3 bg-green-50 rounded-xl px-5 py-3">
                    <span className="text-green-600 text-3xl leading-none">⛨</span>
                    <div>
                        <p className="font-semibold text-slate-900">100% Secure Payments</p>
                        <p className="text-sm text-gray-600">Your payments are safe with bank-level security.</p>
                    </div>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
                {stats.map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-5 flex items-center gap-4`}>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold ${s.iconBg}`}>
                            {s.icon}
                        </div>
                        <div>
                            <p className={`text-sm font-medium ${s.labelColor}`}>{s.label}</p>
                            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
                            <p className={`text-sm ${s.subColor}`}>{s.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table card */}
            <div className="mt-6 bg-white rounded-xl shadow-sm">
                {/* Tabs + filters */}
                <div className="flex flex-wrap items-center justify-between gap-4 px-5 pt-4 border-b">
                    <div className="flex gap-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setPage(1);
                                }}
                                className={`pb-3 font-medium border-b-2 -mb-px ${activeTab === tab.id
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 pb-3">
                        <select value={month} onChange={withReset(setMonth)} className="border rounded-lg px-3 py-2 text-sm bg-white">
                            <option value="all">All months</option>
                            {months.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                        <select value={method} onChange={withReset(setMethod)} className="border rounded-lg px-3 py-2 text-sm bg-white">
                            <option value="all">Payment Method</option>
                            {methods.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                        <button onClick={downloadCSV} className="border rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50">
                            ⬇ Download
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-sm text-gray-600">
                                <th className="px-5 py-3 font-medium">Date</th>
                                <th className="px-3 py-3 font-medium">Booking ID</th>
                                <th className="px-3 py-3 font-medium">Route</th>
                                <th className="px-3 py-3 font-medium">Amount</th>
                                <th className="px-3 py-3 font-medium">Payment Method</th>
                                <th className="px-3 py-3 font-medium">Status</th>
                                <th className="px-3 py-3 font-medium">Invoice</th>
                                <th className="px-3 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {rows.map((t) => (
                                <tr key={t.id} className="text-sm">
                                    <td className="px-5 py-4">
                                        <p className="font-medium text-slate-900">{t.date}</p>
                                        <p className="text-gray-500">{t.time}</p>
                                    </td>
                                    <td className="px-3 py-4 text-gray-600">{t.bookingId}</td>
                                    <td className="px-3 py-4">
                                        <p className="font-medium text-slate-900">
                                            {t.from} → {t.to}
                                        </p>
                                        <p className="text-gray-500">
                                            {t.load} • {t.cargo}
                                        </p>
                                    </td>
                                    <td className="px-3 py-4 font-semibold text-slate-900">{formatINR(t.amount)}</td>
                                    <td className="px-3 py-4">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${methodBadge[t.method]}`}>
                                                {t.method.slice(0, 2).toUpperCase()}
                                            </span>
                                            {t.method}
                                        </div>
                                    </td>
                                    <td className="px-3 py-4">
                                        <span className={`px-3 py-1 rounded-md font-medium ${statusStyle[t.status].cls}`}>
                                            {statusStyle[t.status].label}
                                        </span>
                                    </td>
                                    <td className="px-3 py-4">
                                        {t.status === "pending" ? (
                                            <span className="text-gray-400">-</span>
                                        ) : (
                                            <button
                                                onClick={() => handleInvoice(t)}
                                                className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md font-medium hover:bg-blue-100"
                                            >
                                                ⭳ Download
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-3 py-4 text-gray-500 cursor-pointer">⋮</td>
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="py-10 text-center text-gray-500">
                                        Is filter ke liye koi transaction nahi mila.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-5 py-4 border-t">
                    <p className="text-sm text-gray-600">
                        Showing {filtered.length === 0 ? 0 : start + 1} – {start + rows.length} of {filtered.length} transactions
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-9 h-9 border rounded-lg disabled:opacity-40"
                        >
                            ‹
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-9 h-9 rounded-lg border ${p === currentPage ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-50"
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="w-9 h-9 border rounded-lg disabled:opacity-40"
                        >
                            ›
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Payments;