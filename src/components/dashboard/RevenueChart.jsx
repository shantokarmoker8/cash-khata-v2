// src/components/dashboard/RevenueChart.jsx
import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
} from "chart.js";
import { useNavigate } from "react-router-dom";
import { FaList } from "react-icons/fa6";
import Modal from "../common/Modal";
import Loader from "../common/Loader";
import { fetchChartData } from "../../services/dashboardService";
import { formatCurrency } from "../../utils/formatCurrency";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip);

const DAY_FILTERS = [
  { label: "Last 7 Days", value: 7 },
  { label: "Last 30 Days", value: 30 },
  { label: "Last 1 Year", value: 365 },
];

const TYPE_ROUTE_MAP = {
  purchase: "/purchase",
  sales: "/sales",
  profit: "/sales",
  expenses: "/expenses",
  customer_due: "/settings",
  supplier_due: "/settings",
};

export default function RevenueChart({ isOpen, onClose, type, title }) {
  const navigate = useNavigate();
  const [days, setDays] = useState(7);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !type) return;

    // due-list চার্টে day filter প্রযোজ্য না, তাই প্রতিবার modal খোলার সময় 7 দিয়ে reset
    setDays(7);
  }, [isOpen, type]);

  useEffect(() => {
    if (!isOpen || !type) return;

    let cancelled = false;
    setLoading(true);

    fetchChartData(type, days).then((result) => {
      if (!cancelled) {
        setChartData(result);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, type, days]);

  const isDueChart = type === "customer_due" || type === "supplier_due";
  const total = chartData ? chartData.values.reduce((sum, v) => sum + v, 0) : 0;

  const dataset = chartData
    ? {
        labels: chartData.labels,
        datasets: [
          {
            label: title,
            data: chartData.values,
            borderColor: "#2563eb",
            backgroundColor: isDueChart ? "#2563eb" : "rgba(37, 99, 235, 0.1)",
            tension: 0.35,
            fill: true,
            pointRadius: 3,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-[640px]">
      {!isDueChart && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {DAY_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setDays(f.value)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
                days === f.value
                  ? "bg-primary-blue text-white border-primary-blue"
                  : "bg-white text-text-muted border-border-color hover:border-primary-blue"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div className="relative h-[280px]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader />
          </div>
        ) : dataset && chartData.values.length > 0 ? (
          isDueChart ? (
            <Bar data={dataset} options={chartOptions} />
          ) : (
            <Line data={dataset} options={chartOptions} />
          )
        ) : (
          <div className="h-full flex items-center justify-center text-text-muted text-sm">
            No data available
          </div>
        )}
      </div>

      {!loading && chartData && (
        <div className="mt-3 text-center text-text-muted text-[13px]">
          Total: <span className="font-semibold text-text-dark">{formatCurrency(total)}</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          onClose();
          navigate(TYPE_ROUTE_MAP[type] || "/dashboard");
        }}
        className="ck-btn-primary w-full flex items-center justify-center gap-2 mt-3"
      >
        <FaList /> View List
      </button>
    </Modal>
  );
}