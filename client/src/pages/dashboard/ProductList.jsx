// pages/dashboard/ProductList.jsx
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import TanstackTable from "@/components/TanstackTable";

const ProductList = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product inventory and listings.
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/products/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            View, edit, and manage all your products in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TanstackTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductList;
