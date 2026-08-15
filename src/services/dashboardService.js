// src/services/dashboardService.js
import {
  getDocs,
  query,
  where,
  orderBy,
  limit as fbLimit,
  Timestamp,
} from "firebase/firestore";
import {
  purchasesCol,
  salesCol,
  expensesCol,
  customersCol,
  suppliersCol,
} from "../firebase/firestoreRefs";

/**
 * period ('today' | '7' | '30' | '365') কে একটা শুরুর Date এ রূপান্তর করে —
 * PHP এর periodCondition() SQL ফাংশনের সমতুল্য
 */
function periodToStartDate(period) {
  const now = new Date();
  if (period === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const days = Number(period) || 7;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

/**
 * Dashboard Summary — total_purchase, total_sales, total_profit, dues, expenses,
 * recent_purchases, recent_sales — সব একসাথে। PHP এর api/dashboard/summary.php এর সমতুল্য।
 */
export async function fetchDashboardSummary(period = "today") {
  const startDate = periodToStartDate(period);
  const startTimestamp = Timestamp.fromDate(startDate);

  // ============ Total Purchase (period-filtered) ============
  const purchaseQ = query(purchasesCol, where("created_at", ">=", startTimestamp));
  const purchaseSnap = await getDocs(purchaseQ);
  let totalPurchase = 0;
  purchaseSnap.forEach((d) => {
    totalPurchase += Number(d.data().total_amount) || 0;
  });

  // ============ Total Sales + COGS (period-filtered) ============
  const salesQ = query(salesCol, where("created_at", ">=", startTimestamp));
  const salesSnap = await getDocs(salesQ);
  let totalSales = 0;
  let cogs = 0;
  salesSnap.forEach((d) => {
    const s = d.data();
    totalSales += Number(s.total_amount) || 0;
    cogs += (Number(s.quantity) || 0) * (Number(s.purchase_price_snapshot) || 0);
  });

  // ============ Total Expenses (period-filtered) ============
  const expenseQ = query(expensesCol, where("created_at", ">=", startTimestamp));
  const expenseSnap = await getDocs(expenseQ);
  let totalExpenses = 0;
  expenseSnap.forEach((d) => {
    totalExpenses += Number(d.data().amount) || 0;
  });

  const totalProfit = totalSales - cogs - totalExpenses;

  // ============ Customer/Supplier Due — সবসময় বর্তমান মোট (period-independent) ============
  const customersSnap = await getDocs(customersCol);
  let customerDue = 0;
  customersSnap.forEach((d) => {
    customerDue += Number(d.data().due) || 0;
  });

  const suppliersSnap = await getDocs(suppliersCol);
  let supplierDue = 0;
  suppliersSnap.forEach((d) => {
    supplierDue += Number(d.data().due) || 0;
  });

  // ============ Recent Purchase / Sales — সবসময় সাম্প্রতিক ১০টা ============
  const recentPurchaseQ = query(purchasesCol, orderBy("created_at", "desc"), fbLimit(10));
  const recentPurchaseSnap = await getDocs(recentPurchaseQ);
  const recentPurchases = recentPurchaseSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const recentSalesQ = query(salesCol, orderBy("created_at", "desc"), fbLimit(10));
  const recentSalesSnap = await getDocs(recentSalesQ);
  const recentSales = recentSalesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return {
    total_purchase: totalPurchase,
    total_sales: totalSales,
    total_profit: totalProfit,
    customer_due: customerDue,
    supplier_due: supplierDue,
    total_expenses: totalExpenses,
    recent_purchases: recentPurchases,
    recent_sales: recentSales,
  };
}

/**
 * Chart popup ডেটা — type অনুযায়ী দিনভিত্তিক গ্রুপ করা values, বা due-list bar chart।
 * PHP এর api/dashboard/chart.php এর সমতুল্য।
 */
export async function fetchChartData(type, days = 7) {
  // ============ Due-list chart type (bar) ============
  if (type === "customer_due" || type === "supplier_due") {
    const col = type === "customer_due" ? customersCol : suppliersCol;
    const snap = await getDocs(col);
    const rows = snap.docs
      .map((d) => d.data())
      .filter((r) => Number(r.due) > 0)
      .sort((a, b) => Number(b.due) - Number(a.due))
      .slice(0, 10);

    return {
      chart_type: "bar",
      labels: rows.map((r) => r.name),
      values: rows.map((r) => Number(r.due)),
    };
  }

  // ============ Day-wise line chart types ============
  const startDate = periodToStartDate(String(days));
  const startTimestamp = Timestamp.fromDate(startDate);

  let colRef;
  let amountField;
  if (type === "purchase") {
    colRef = purchasesCol;
    amountField = "total_amount";
  } else if (type === "sales" || type === "profit") {
    colRef = salesCol;
    amountField = "total_amount";
  } else if (type === "expenses") {
    colRef = expensesCol;
    amountField = "amount";
  } else {
    throw new Error("Invalid chart type");
  }

  const q = query(colRef, where("created_at", ">=", startTimestamp), orderBy("created_at", "asc"));
  const snap = await getDocs(q);

  // দিন অনুযায়ী গ্রুপ করা হচ্ছে
  const grouped = {};
  snap.forEach((d) => {
    const data = d.data();
    const created = data.created_at?.toDate ? data.created_at.toDate() : new Date(data.created_at);
    const dayKey = created.toISOString().split("T")[0];

    let value = Number(data[amountField]) || 0;
    if (type === "profit") {
      const cogs = (Number(data.quantity) || 0) * (Number(data.purchase_price_snapshot) || 0);
      value = value - cogs;
    }

    grouped[dayKey] = (grouped[dayKey] || 0) + value;
  });

  const sortedKeys = Object.keys(grouped).sort();
  return {
    chart_type: "line",
    labels: sortedKeys.map((k) => new Date(k).toLocaleDateString("en-US", { month: "short", day: "2-digit" })),
    values: sortedKeys.map((k) => grouped[k]),
  };
}