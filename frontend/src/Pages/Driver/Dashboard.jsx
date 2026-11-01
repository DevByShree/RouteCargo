import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Plus,
  User,
  MapPin,
  CalendarDays,
  IndianRupee,
  Send,
  TrendingUp,
  RefreshCw,
  CircleCheck,
  AlertCircle,
} from "lucide-react";

const TRUCKS_KEY = "routecargo_vehicles";
const PROFILE_KEY = "routecargo_driver_profile";
const REQUESTS_KEY = "routecargo_customer_requests";
const CAPACITY_KEY = "routecargo_capacity_posts";

const SAMPLE_TRUCKS = [
  {
    id: "truck-1",
    name: "Truck 1",
    number: "MH12AB1234",
    type: "Tata 14 Wheeler",
    capacity: 8,
    capacityUnit: "tons",
    fuelType: "Diesel",
    available: true,
  },
  {
    id: "truck-2",
    name: "Truck 2",
    number: "MH40XY5678",
    type: "Ashok Leyland 16 Wheeler",
    capacity: 15,
    capacityUnit: "tons",
    fuelType: "Diesel",
    available: true,
  },
  {
    id: "truck-3",
    name: "Truck 3",
    number: "RJ14CD9876",
    type: "Eicher 12 Wheeler",
    capacity: 10,
    capacityUnit: "tons",
    fuelType: "Diesel",
    available: true,
  },
];

const SAMPLE_REQUESTS = [
  {
    id: "CARGO-1001",
    customerName: "Aarav Industries",
    from: "Pune, Maharashtra",
    to: "Mumbai, Maharashtra",
    date: "2026-11-02",
    loadType: "Industrial goods",
    weight: 3.5,
    unit: "tons",
    amount: 18500,
    status: "Pending",
  },
  {
    id: "CARGO-1002",
    customerName: "Neha Traders",
    from: "Nashik, Maharashtra",
    to: "Pimpri, Maharashtra",
    date: "2026-11-04",
    loadType: "Small goods",
    weight: 850,
    unit: "kg",
    amount: 6200,
    status: "Accepted",
  },
  {
    id: "CARGO-1003",
    customerName: "Metro Fabrication",
    from: "Aurangabad, Maharashtra",
    to: "Pune, Maharashtra",
    date: "2026-11-06",
    loadType: "Industrial goods",
    weight: 5,
    unit: "tons",
    amount: 22000,
    status: "In Transit",
  },
];

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Accepted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  "In Transit": "bg-blue-50 text-blue-700 ring-blue-200",
  Completed: "bg-slate-100 text-slate-700 ring-slate-200",
  Available: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "Not scheduled";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function DriverDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(() =>
    readStorage(PROFILE_KEY, {})
  );

  const [trucks, setTrucks] = useState(() =>
    readStorage(TRUCKS_KEY, SAMPLE_TRUCKS)
  );

  const [requests, setRequests] = useState(() =>
    readStorage(REQUESTS_KEY, SAMPLE_REQUESTS)
  );

  const [capacityPosts, setCapacityPosts] = useState(() =>
    readStorage(CAPACITY_KEY, [])
  );

  const [activeFilter, setActiveFilter] = useState("All");

  const refreshDashboard = () => {
    setProfile(readStorage(PROFILE_KEY, {}));
    setTrucks(readStorage(TRUCKS_KEY, SAMPLE_TRUCKS));
    setRequests(readStorage(REQUESTS_KEY, SAMPLE_REQUESTS));
    setCapacityPosts(readStorage(CAPACITY_KEY, []));
  };

  useEffect(() => {
    const handleStorage = (event) => {
      if (
        !event.key ||
        [
          PROFILE_KEY,
          TRUCKS_KEY,
          REQUESTS_KEY,
          CAPACITY_KEY,
        ].includes(event.key)
      ) {
        refreshDashboard();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const availableTrucks = useMemo(
    () => trucks.filter((truck) => truck.available !== false),
    [trucks]
  );

  const requestCounts = useMemo(
    () => ({
      All: requests.length,
      Pending: requests.filter((r) => r.status === "Pending").length,
      Accepted: requests.filter((r) => r.status === "Accepted").length,
      Rejected: requests.filter((r) => r.status === "Rejected").length,
      "In Transit": requests.filter((r) => r.status === "In Transit").length,
      Completed: requests.filter((r) => r.status === "Completed").length,
    }),
    [requests]
  );

  const filteredRequests = useMemo(() => {
    const filtered =
      activeFilter === "All"
        ? requests
        : requests.filter((request) => request.status === activeFilter);

    return [...filtered]
      .sort((a, b) => {
        const aDate = a.createdAt || a.date || "";
        const bDate = b.createdAt || b.date || "";
        return String(bDate).localeCompare(String(aDate));
      })
      .slice(0, 5);
  }, [requests, activeFilter]);

  const totalAvailableCapacity = availableTrucks.reduce(
    (sum, truck) => sum + (Number(truck.capacity) || 0),
    0
  );

  const pendingRequests = requestCounts.Pending;
  const completedRequests = requestCounts.Completed;

  const quickActions = [
    {
      title: "Add Vehicle",
      description: "Register a new truck",
      icon: Plus,
      color: "bg-blue-50 text-blue-600",
      action: () => navigate("/driver/vehicles"),
    },
    {
      title: "Raise Request",
      description: "Publish truck availability",
      icon: Send,
      color: "bg-violet-50 text-violet-600",
      action: () => navigate("/driver/raise-request"),
    },
    {
      title: "My Requests",
      description: "Review customer bookings",
      icon: Package,
      color: "bg-emerald-50 text-emerald-600",
      action: () => navigate("/driver/requests"),
    },
    {
      title: "My Profile",
      description: "Update your information",
      icon: User,
      color: "bg-amber-50 text-amber-600",
      action: () => navigate("/driver/profile"),
    },
  ];

  const stats = [
    {
      title: "Total Vehicles",
      value: trucks.length,
      subtitle: `${availableTrucks.length} available for bookings`,
      icon: Truck,
      iconClass: "bg-blue-50 text-blue-600",
      borderClass: "border-l-blue-500",
    },
    {
      title: "Pending Requests",
      value: pendingRequests,
      subtitle: "Awaiting your decision",
      icon: Clock,
      iconClass: "bg-amber-50 text-amber-600",
      borderClass: "border-l-amber-500",
    },
    {
      title: "In Transit",
      value: requestCounts["In Transit"],
      subtitle: "Loads currently in transit",
      icon: TrendingUp,
      iconClass: "bg-violet-50 text-violet-600",
      borderClass: "border-l-violet-500",
    },
    {
      title: "Completed Loads",
      value: completedRequests,
      subtitle: "Successfully completed",
      icon: CheckCircle2,
      iconClass: "bg-emerald-50 text-emerald-600",
      borderClass: "border-l-emerald-500",
    },
  ];

  const firstName = profile.ownerName?.trim().split(/\s+/)[0] || "Driver";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-blue-600">
              RouteCargo / Driver Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back, {firstName}!
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your fleet, cargo requests and transport availability.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={refreshDashboard}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => navigate("/driver/raise-request")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus size={17} />
              Publish Availability
            </button>
          </div>
        </header>

        {/* Profile summary */}
        <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-5 text-white shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-blue-100">
                <CircleCheck size={14} />
                Driver workspace
              </div>

              <h2 className="text-xl font-bold sm:text-2xl">
                {profile.companyName || "Your Transport Business"}
              </h2>

              <p className="mt-2 text-sm text-slate-300">
                {profile.contactNumber || "Add your contact number"}{" "}
                {profile.email ? `· ${profile.email}` : ""}
              </p>

              <p className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                <MapPin size={15} />
                {profile.address || "Add your business location"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/driver/profile")}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 sm:self-center"
            >
              <User size={16} />
              View Profile
              <ArrowRight size={15} />
            </button>
          </div>
        </section>

        {/* Statistics */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Fleet Overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              A quick look at your transport operations.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.title}
                  className={`rounded-xl border border-slate-200 border-l-4 ${stat.borderClass} bg-white p-5 shadow-sm`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {stat.title}
                      </p>
                      <p className="mt-3 text-3xl font-bold text-slate-900">
                        {stat.value}
                      </p>
                    </div>

                    <div className={`rounded-xl p-3 ${stat.iconClass}`}>
                      <Icon size={22} />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    {stat.subtitle}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Fleet capacity and request overview */}
        <section className="grid gap-5 lg:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-900">
                  Fleet Availability
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your registered vehicles and their current availability.
                </p>
              </div>

              <Truck size={22} className="text-blue-600" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Total Fleet
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {trucks.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">Vehicles</p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs font-medium text-emerald-700">
                  Available
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-800">
                  {availableTrucks.length}
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  Ready for bookings
                </p>
              </div>

              <div className="col-span-2 rounded-xl bg-blue-50 p-4 sm:col-span-1">
                <p className="text-xs font-medium text-blue-700">
                  Total Capacity
                </p>
                <p className="mt-2 text-2xl font-bold text-blue-900">
                  {totalAvailableCapacity}
                </p>
                <p className="mt-1 text-xs text-blue-700">
                  Sum of available truck capacities
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {trucks.slice(0, 4).map((truck) => (
                <div
                  key={truck.id}
                  className="flex flex-col justify-between gap-3 rounded-lg border border-slate-100 p-3 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-lg bg-slate-100 p-2.5 text-slate-600">
                      <Truck size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {truck.name || truck.type}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {truck.number} · {truck.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="text-sm font-semibold text-slate-700">
                      {truck.capacity} {truck.capacityUnit}
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        truck.available === false
                          ? "bg-slate-100 text-slate-500"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {truck.available === false
                        ? "Unavailable"
                        : "Available"}
                    </span>
                  </div>
                </div>
              ))}

              {trucks.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
                  <Truck
                    size={28}
                    className="mx-auto text-slate-300"
                  />
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    No vehicles registered
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Add a truck to start publishing your availability.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/driver/vehicles")}
                    className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Add your first vehicle
                  </button>
                </div>
              )}
            </div>

            {trucks.length > 4 && (
              <button
                type="button"
                onClick={() => navigate("/driver/vehicles")}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                View all vehicles
                <ArrowRight size={15} />
              </button>
            )}
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Package size={20} className="text-blue-600" />
              <h2 className="font-bold text-slate-900">
                Request Summary
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Customer cargo booking status.
            </p>

            <div className="mt-5 space-y-4">
              {[
                {
                  label: "Pending",
                  value: requestCounts.Pending,
                  icon: Clock,
                  color: "text-amber-600 bg-amber-50",
                },
                {
                  label: "Accepted",
                  value: requestCounts.Accepted,
                  icon: CheckCircle2,
                  color: "text-emerald-600 bg-emerald-50",
                },
                {
                  label: "In Transit",
                  value: requestCounts["In Transit"],
                  icon: Truck,
                  color: "text-blue-600 bg-blue-50",
                },
                {
                  label: "Completed",
                  value: requestCounts.Completed,
                  icon: CheckCircle2,
                  color: "text-slate-600 bg-slate-100",
                },
                {
                  label: "Rejected",
                  value: requestCounts.Rejected,
                  icon: XCircle,
                  color: "text-rose-600 bg-rose-50",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${item.color}`}>
                        <Icon size={17} />
                      </div>
                      <span className="text-sm text-slate-600">
                        {item.label}
                      </span>
                    </div>

                    <span className="text-lg font-bold text-slate-900">
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => navigate("/driver/requests")}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Manage Requests
              <ArrowRight size={15} />
            </button>
          </article>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Quick Actions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Access your frequently used driver features.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  type="button"
                  key={action.title}
                  onClick={action.action}
                  className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  <div className={`rounded-xl p-3 ${action.color}`}>
                    <Icon size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">
                      {action.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {action.description}
                    </p>
                  </div>

                  <ArrowRight
                    size={17}
                    className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                  />
                </button>
              );
            })}
          </div>
        </section>

        {/* Recent Requests */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recent Cargo Requests
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review the latest customer bookings and their routes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/driver/requests")}
              className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:self-center"
            >
              View All
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto border-b border-slate-100 px-5 py-3 sm:px-6">
            {["All", "Pending", "Accepted", "In Transit", "Completed", "Rejected"].map(
              (status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    activeFilter === status
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status} ({requestCounts[status]})
                </button>
              )
            )}
          </div>

          {filteredRequests.length === 0 ? (
            <div className="p-10 text-center">
              <AlertCircle
                size={30}
                className="mx-auto text-slate-300"
              />
              <h3 className="mt-3 font-semibold text-slate-800">
                No requests found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                There are no requests for this status.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRequests.map((request) => (
                <article
                  key={request.id}
                  className="p-5 transition hover:bg-slate-50/70 sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">
                          {request.id}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                            statusStyles[request.status] ||
                            statusStyles.Pending
                          }`}
                        >
                          {request.status}
                        </span>

                        {request.loadType && (
                          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                            {request.loadType}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 flex flex-wrap items-center gap-2 font-bold text-slate-900">
                        <span>{request.from || "Pickup not specified"}</span>
                        <ArrowRight
                          size={16}
                          className="text-blue-500"
                        />
                        <span>{request.to || "Destination not specified"}</span>
                      </h3>

                      <p className="mt-2 text-sm text-slate-600">
                        {request.customerName || request.companyName || "Customer"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {formatDate(request.date)}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Package size={14} />
                          {request.weight ?? "N/A"} {request.unit || ""}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <IndianRupee size={14} />
                          {formatCurrency(request.amount)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/driver/requests")}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      View Request
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="border-t border-slate-100 px-5 py-3 sm:px-6">
            <p className="text-xs text-slate-400">
              Dashboard data is currently read from this browser's localStorage.
              Connect your backend API to share live data across accounts.
            </p>
          </div>
        </section>

        {/* Published Availability */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="flex items-center gap-2 font-bold text-slate-900">
                <Send size={19} className="text-blue-600" />
                Published Availability
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Truck capacity posts created using Raise Request.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/driver/raise-request")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={16} />
              Publish New
            </button>
          </div>

          {capacityPosts.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-6 text-center">
              <Truck size={28} className="mx-auto text-slate-300" />
              <p className="mt-2 font-semibold text-slate-800">
                No availability published yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Publish your available truck capacity to help customers find
                suitable transport.
              </p>
              <button
                type="button"
                onClick={() => navigate("/driver/raise-request")}
                className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Raise a Request
              </button>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {capacityPosts.slice(0, 6).map((post) => (
                <article
                  key={post.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900">
                        {post.truckName || "Truck"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {post.truckNumber || post.vehicleType || "Vehicle"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        statusStyles[post.status] || statusStyles.Available
                      }`}
                    >
                      {post.status || "Available"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-50 p-3">
                    <div>
                      <p className="text-xs text-blue-700">
                        Available capacity
                      </p>
                      <p className="mt-1 font-bold text-blue-900">
                        {post.availableCapacity} {post.capacityUnit}
                      </p>
                    </div>

                    <Truck size={22} className="text-blue-600" />
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <MapPin size={15} className="shrink-0 text-slate-400" />
                      <span className="truncate">
                        {post.from} → {post.to}
                      </span>
                    </p>

                    <p className="flex items-center gap-2">
                      <CalendarDays
                        size={15}
                        className="shrink-0 text-slate-400"
                      />
                      {formatDate(post.date)}
                    </p>
                  </div>

                  {post.loadTypes?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {post.loadTypes.map((type) => (
                        <span
                          key={type}
                          className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 py-4 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} RouteCargo Driver Portal</p>
          <button
            type="button"
            onClick={() => navigate("/driver/profile")}
            className="self-start font-medium text-slate-500 hover:text-blue-600 sm:self-auto"
          >
            Manage Driver Profile
          </button>
        </footer>
      </div>
    </main>
  );
}