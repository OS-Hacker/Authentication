// pages/dashboard/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
  ArrowUpRight,
  Calendar,
  Activity,
  CreditCard,
} from "lucide-react";

// Mock data - in real world, this would come from API
const dashboardData = {
  stats: {
    totalRevenue: 45231.89,
    revenueChange: +12.5,
    orders: 2340,
    ordersChange: +8.1,
    products: 156,
    productsChange: +3.2,
    customers: 892,
    customersChange: +5.7,
  },
  recentOrders: [
    {
      id: "ORD-001",
      customer: "John Doe",
      amount: 299.99,
      status: "completed",
      date: "2024-01-15",
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      amount: 159.50,
      status: "processing",
      date: "2024-01-15",
    },
    {
      id: "ORD-003",
      customer: "Bob Johnson",
      amount: 89.99,
      status: "pending",
      date: "2024-01-14",
    },
    {
      id: "ORD-004",
      customer: "Alice Brown",
      amount: 450.00,
      status: "completed",
      date: "2024-01-14",
    },
  ],
  topProducts: [
    {
      name: "Wireless Headphones",
      sales: 234,
      revenue: 35010,
      stock: 45,
    },
    {
      name: "Smart Watch",
      sales: 189,
      revenue: 28350,
      stock: 12,
    },
    {
      name: "Laptop Backpack",
      sales: 156,
      revenue: 10920,
      stock: 78,
    },
    {
      name: "USB-C Cable",
      sales: 432,
      revenue: 8640,
      stock: 200,
    },
  ],
  activity: [
    {
      action: "New order placed",
      description: "ORD-005 by Michael Chen",
      time: "2 minutes ago",
    },
    {
      action: "Product updated",
      description: "Wireless Headphones stock updated",
      time: "15 minutes ago",
    },
    {
      action: "New customer registered",
      description: "sarah.wilson@email.com",
      time: "1 hour ago",
    },
    {
      action: "Payment received",
      description: "$299.99 for ORD-001",
      time: "2 hours ago",
    },
  ],
};

const Dashboard = () => {
  const { stats, recentOrders, topProducts, activity } = dashboardData;

  const StatCard = ({ title, value, change, icon: Icon, trend }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {title.includes("Revenue") ? `$${value.toLocaleString()}` : value.toLocaleString()}
        </div>
        <div className={`flex items-center text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
          {Math.abs(change)}% from last month
        </div>
      </CardContent>
    </Card>
  );

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      completed: { label: "Completed", variant: "default" },
      processing: { label: "Processing", variant: "secondary" },
      pending: { label: "Pending", variant: "outline" },
      cancelled: { label: "Cancelled", variant: "destructive" },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-4 space-x-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
          <Button asChild size="sm">
            <Link to="/dashboard/create-product">
              <Plus className="h-4 w-4 mr-2" />
              New Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          change={stats.revenueChange}
          icon={DollarSign}
          trend="up"
        />
        <StatCard
          title="Orders"
          value={stats.orders}
          change={stats.ordersChange}
          icon={ShoppingCart}
          trend="up"
        />
        <StatCard
          title="Products"
          value={stats.products}
          change={stats.productsChange}
          icon={Package}
          trend="up"
        />
        <StatCard
          title="Customers"
          value={stats.customers}
          change={stats.customersChange}
          icon={Users}
          trend="up"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Orders */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders from your store</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/orders">
                  View all
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{order.id}</p>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${order.amount}</p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar - Top Products & Activity */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best selling products this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${product.revenue.toLocaleString()}</p>
                    <div className="flex items-center gap-2">
                      <div className={`h-1 w-12 rounded-full ${
                        product.stock > 20 ? 'bg-green-500' : product.stock > 5 ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      <p className="text-xs text-muted-foreground">{product.stock} in stock</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest events in your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activity.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div className="h-full w-px bg-border mt-1" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
              <Link to="/dashboard/create-product">
                <Plus className="h-6 w-6" />
                <span>Add Product</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
              <Link to="/dashboard/orders">
                <ShoppingCart className="h-6 w-6" />
                <span>View Orders</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
              <Link to="/dashboard/customers">
                <Users className="h-6 w-6" />
                <span>Manage Customers</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
              <Link to="/dashboard/analytics">
                <Activity className="h-6 w-6" />
                <span>View Analytics</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;