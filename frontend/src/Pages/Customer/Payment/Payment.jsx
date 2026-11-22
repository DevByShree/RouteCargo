import { CreditCard } from "lucide-react";

export default function Payments() {
  return <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 sm:px-8">
    <div className="mx-auto max-w-4xl"><h1 className="text-3xl font-bold text-blue-950">Payments</h1><p className="mt-1 text-slate-600">Payment records for your RouteCargo bookings.</p>
      <section className="mt-7 rounded-xl border border-slate-200 bg-white p-10 text-center"><CreditCard size={34} className="mx-auto text-slate-400"/><h2 className="mt-3 font-semibold">No payment records available</h2><p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">This project does not yet have a payment API or payment database model. No payment status or transaction history is being shown as real until that integration exists.</p></section>
    </div>
  </main>;
}
