// components/ProductTable.jsx
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/Api";

// Columns remain same as your current definition
// Define the column structure
const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "productName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-start p-0 hover:bg-transparent"
        >
          Product Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium min-w-[120px]">
        {row.getValue("productName")}
      </div>
    ),
    size: 150,
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-end p-0 hover:bg-transparent"
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(price);

      return (
        <div className="text-right font-medium whitespace-nowrap">
          {formatted}
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "stock",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-center p-0 hover:bg-transparent"
        >
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const stock = parseInt(row.getValue("stock"));
      const getStockStatus = (quantity) => {
        if (quantity === 0)
          return { label: "Out of Stock", variant: "destructive" };
        if (quantity <= 10) return { label: "Low Stock", variant: "secondary" };
        return { label: "In Stock", variant: "default" };
      };

      const status = getStockStatus(stock);

      return (
        <div className="flex flex-col items-center gap-1 min-w-[100px]">
          <span className="font-medium text-base">{stock}</span>
          <Badge variant={status.variant} className="text-xs">
            {status.label}
          </Badge>
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: "categories",
    header: () => <div className="text-left">Categories</div>,
    cell: ({ row }) => {
      const categories = row.getValue("categories");
      return (
        <div className="flex flex-wrap gap-1 min-w-[150px] max-w-[200px]">
          {Array.isArray(categories) &&
            categories.slice(0, 2).map((category, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs capitalize"
              >
                {category}
              </Badge>
            ))}
          {Array.isArray(categories) && categories.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{categories.length - 2}
            </Badge>
          )}
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: "selectedValue",
    header: () => <div className="text-left">Primary Category</div>,
    cell: ({ row }) => {
      const category = row.getValue("selectedValue");
      return (
        <Badge variant="secondary" className="capitalize whitespace-nowrap">
          {category}
        </Badge>
      );
    },
    size: 140,
  },
  {
    accessorKey: "description",
    header: () => <div className="text-left">Description</div>,
    cell: ({ row }) => {
      const description = row.getValue("description");
      return (
        <div
          className="max-w-[180px] truncate text-sm text-muted-foreground"
          title={description}
        >
          {description || "No description"}
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-start p-0 hover:bg-transparent"
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-sm whitespace-nowrap min-w-[100px]">
          {date.toLocaleDateString("en-IN")}
        </div>
      );
    },
    size: 120,
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const product = row.original;

      const handleView = () => {
        console.log("View product:", product._id);
      };

      const handleEdit = () => {
        console.log("Edit product:", product._id);
      };

      const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this product?")) {
          try {
            await api.delete(`/products/${product._id}`);
            console.log("Product deleted successfully");
          } catch (error) {
            console.error("Failed to delete product:", error);
          }
        }
      };

      return (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleView}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableHiding: false,
    size: 80,
  },
];

function TanstackTable() {
  // Table state
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch data from backend with pagination & filters
  const fetchProducts = async () => {
    try {
      setIsLoading(true);

      // Backend expects 1-based page index
      const page = pagination.pageIndex + 1;
      const limit = pagination.pageSize;

      // Add search/filter query if applied
      const search = columnFilters.find((f) => f.id === "productName")?.value;

      // Build query params
      const query = new URLSearchParams({
        page,
        limit,
        search: search || "",
      }).toString();

      const response = await api.get(`/products?${query}`);

      if (response.data?.success) {
        setData(response.data.data || []);
        setTotalItems(response.data.pagination.totalItems);
        setPageCount(response.data.pagination.totalPages);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount and when pagination/sorting/filter changes
  useEffect(() => {
    fetchProducts();
  }, [pagination.pageIndex, pagination.pageSize, columnFilters, sorting]);

  // React Table instance
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    manualPagination: true, // server-side
    manualSorting: true, // server-side
    manualFiltering: true, // server-side
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Search & Columns */}
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter products..."
          value={table.getColumn("productName")?.getFilterValue() ?? ""}
          onChange={(e) =>
            table.getColumn("productName")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize"
                    checked={col.getIsVisible()}
                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {data.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 align-top">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {data.length} of {totalItems} products
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
          <div className="text-sm font-medium whitespace-nowrap">
            Page {pagination.pageIndex + 1} of {pageCount}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TanstackTable;
