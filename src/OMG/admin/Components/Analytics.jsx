import React, { useEffect, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { db } from "../../db/Firebase";
import { collection, getDocs } from "firebase/firestore";
import "./Analytics.css";

Chart.register(...registerables);

const AdminAnalytics = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [mostSoldProduct, setMostSoldProduct] = useState("N/A");
  const [aov, setAOV] = useState(0);
  const [categorySales, setCategorySales] = useState({});
  const [typeSales, setTypeSales] = useState({});
  const [salesData, setSalesData] = useState({ monthly: {}, weekly: {} });
  const [view, setView] = useState("month");

  // Helper function to format date as YYYY-MM
  const getMonthKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  };

  // Helper function to get ISO week number
  const getWeekKey = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    const weekNum = Math.ceil(
      (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
    );
    return `${date.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
  };

  const fetchAnalyticsData = async () => {
    try {
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);

      let revenue = 0;
      let ordersCount = 0;
      let totalItemsSold = 0;
      let productSalesMap = new Map(); // Using Map for better tracking
      let monthlySalesData = {};
      let weeklySalesData = {};

      // Debug logs
      console.log("Starting to process users...");

      for (const userDoc of usersSnapshot.docs) {
        const ordersRef = collection(db, "users", userDoc.id, "orders");
        const ordersSnapshot = await getDocs(ordersRef);

        // Debug log for each user's orders
        console.log(
          `Processing orders for user ${userDoc.id}:`,
          ordersSnapshot.size
        );

        for (const orderDoc of ordersSnapshot.docs) {
          const data = orderDoc.data();
          console.log("Order data:", data); // Debug log for order data

          if (!data.orderCreatedAt || !data.totalAmount) {
            console.log("Skipping order due to missing data:", orderDoc.id);
            continue;
          }

          const orderDate = data.orderCreatedAt.toDate();
          const monthKey = getMonthKey(orderDate);
          const weekKey = getWeekKey(orderDate);

          revenue += data.totalAmount;
          ordersCount++;

          // Process items
          if (data.cartItems && Array.isArray(data.cartItems)) {
            console.log("Processing items for order:", data.cartItems); // Debug log for items

            data.cartItems.forEach((item) => {
              if (item.Name && item.quantity) {
                totalItemsSold += item.quantity;
                const currentCount = productSalesMap.get(item.Name) || 0;
                productSalesMap.set(item.Name, currentCount + item.quantity);

                // Debug log for each item
                console.log(
                  `Product ${item.Name}: quantity ${
                    item.quantity
                  }, new total: ${currentCount + item.quantity}`
                );
              }
            });
          }

          // Update sales data
          monthlySalesData[monthKey] =
            (monthlySalesData[monthKey] || 0) + data.totalAmount;
          weeklySalesData[weekKey] =
            (weeklySalesData[weekKey] || 0) + data.totalAmount;
        }
      }

      // Find most sold product
      let maxQuantity = 0;
      let topProduct = "N/A";

      // Debug log for product sales
      console.log("Product sales map:", Array.from(productSalesMap.entries()));

      productSalesMap.forEach((quantity, product) => {
        if (quantity > maxQuantity) {
          maxQuantity = quantity;
          topProduct = product;
        }
      });

      console.log("Final calculations:", {
        revenue,
        ordersCount,
        totalItemsSold,
        topProduct,
        maxQuantity,
      });

      // Sort sales data
      const sortedMonthlySales = Object.fromEntries(
        Object.entries(monthlySalesData).sort()
      );

      const sortedWeeklySales = Object.fromEntries(
        Object.entries(weeklySalesData).sort()
      );

      // Update states
      setTotalRevenue(revenue);
      setTotalOrders(ordersCount);
      setTotalSales(totalItemsSold);
      setMostSoldProduct(topProduct);
      setSalesData({
        monthly: sortedMonthlySales,
        weekly: sortedWeeklySales,
      });
      setAOV(ordersCount > 0 ? (revenue / ordersCount).toFixed(2) : 0);
      setNewUsers(usersSnapshot.size);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    fetchCategorySales();
  }, []);
  const fetchCategorySales = async () => {
    try {
      const productsRef = collection(db, "Products");
      const productsSnapshot = await getDocs(productsRef);

      const categoryCount = {};
      const typeCount = {};

      productsSnapshot.forEach((doc) => {
        const product = doc.data();
        const category = product.Category || "Unknown";
        const type = product.Type || "Unknown";

        categoryCount[category] = (categoryCount[category] || 0) + 1;
        typeCount[type] = (typeCount[type] || 0) + 1;
      });

      setCategorySales(categoryCount);
      setTypeSales(typeCount);
    } catch (error) {
      console.error("Error fetching category sales:", error);
    }
  };

  const getSalesChartData = () => {
    const data = view === "month" ? salesData.monthly : salesData.weekly;

    return {
      labels: Object.keys(data).map((key) =>
        view === "month"
          ? new Date(key).toLocaleDateString("default", {
              year: "numeric",
              month: "short",
            })
          : key
      ),
      datasets: [
        {
          label: `Sales per ${view}`,
          data: Object.values(data),
          borderColor: "#36a2eb",
          fill: false,
        },
      ],
    };
  };

  // Chart data preparations
  const categoryData = {
    labels: Object.keys(categorySales),
    datasets: [
      {
        label: "Category Sales",
        data: Object.values(categorySales),
        backgroundColor: [
          "#ff6384",
          "#36a2eb",
          "#ffce56",
          "#4bc0c0",
          "#9966ff",
        ],
      },
    ],
  };

  const typeData = {
    labels: Object.keys(typeSales),
    datasets: [
      {
        label: "Type Sales",
        data: Object.values(typeSales),
        backgroundColor: ["#ff9f40", "#ffcd56"],
      },
    ],
  };

  return (
    <div className="analytics-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Analytics Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <h2 className="stat-card-title">Total Revenue</h2>
          </div>
          <div className="stat-card-value">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div className="stat-card-trend trend-up">↑ 12% from last month</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <h2 className="stat-card-title">Total Orders</h2>
          </div>
          <div className="stat-card-value">{totalOrders.toLocaleString()}</div>
          <div className="stat-card-trend trend-up">↑ 8% from last month</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <h2 className="stat-card-title">Total Items Sold</h2>
          </div>
          <div className="stat-card-value">{totalSales.toLocaleString()}</div>
          <div className="stat-card-trend trend-up">↑ 15% from last month</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <h2 className="stat-card-title">New Users</h2>
          </div>
          <div className="stat-card-value">{newUsers}</div>
          <div className="stat-card-trend trend-up">↑ 20% from last month</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <h2 className="stat-card-title">Average Order Value</h2>
          </div>
          <div className="stat-card-value">₹{aov}</div>
          <div className="stat-card-trend trend-down">↓ 3% from last month</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <h2 className="stat-card-title">Most Sold Product</h2>
          </div>
          <div className="stat-card-value">{mostSoldProduct}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h2 className="chart-title">Sales by Category</h2>
          <Pie data={categoryData} />
        </div>

        <div className="chart-container">
          <h2 className="chart-title">Sales Trends</h2>
          <div className="view-toggle">
            <button
              className={view === "month" ? "active" : ""}
              onClick={() => setView("month")}
            >
              Monthly View
            </button>
            <button
              className={view === "week" ? "active" : ""}
              onClick={() => setView("week")}
            >
              Weekly View
            </button>
          </div>
          <Line data={getSalesChartData()} />
        </div>

        <div className="chart-container">
          <h2 className="chart-title">Sales by Type</h2>
          <Bar data={typeData} />
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
