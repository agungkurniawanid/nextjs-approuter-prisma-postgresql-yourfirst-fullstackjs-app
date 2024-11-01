/* eslint-disable */
"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  user: User;
}

async function getProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  return res.json();
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchUsers, setSearchUsers] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const searchFields = ["name", "user.name"];
    const searchTermLower = searchTerm.toLowerCase();

    const filtered = products.filter((product) => {
      return (
        searchFields.some((field) => {
          const value = field
            .split(".")
            // eslint-disable-next-line
            .reduce((obj: any, key) => obj?.[key], product);
          return value?.toString().toLowerCase().includes(searchTermLower);
        }) ||
        product.price.toString().includes(searchTermLower) ||
        product.id.toString().includes(searchTermLower)
      );
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchTerm, products]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Function to generate pagination range
  const generatePaginationRange = () => {
    const range: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      range.push(1);

      if (currentPage > 3) {
        range.push("...");
      }

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = 4;
      }
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      for (let i = start; i <= end; i++) {
        range.push(i);
      }

      if (currentPage < totalPages - 2) {
        range.push("...");
      }

      if (totalPages > 1) {
        range.push(totalPages);
      }
    }

    return range;
  };

  const totalPrice = currentItems.reduce(
    (sum, product) => sum + product.price,
    0
  );
  const paginationRange = generatePaginationRange();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Input */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative w-full h-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
          <Input
            placeholder="Search by name, owner, price, or ID&hellip;"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Create Data</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Data Table Product</DialogTitle>
                <DialogDescription>
                  Add your data in table product and save changes.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-left whitespace-nowrap">
                    Product Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="ex: Agung Kurniawan"
                    className="col-span-3"
                    name="product_name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="username"
                    className="text-left whitespace-nowrap"
                  >
                    Price
                  </Label>
                  <Input
                    id="username"
                    placeholder="ex: 20000"
                    className="col-span-3"
                    name="price"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Table>
        <TableCaption>
          List of Products (Page {currentPage} of {totalPages})
          {searchTerm && (
            <div className="mt-2 text-sm">
              Found {filteredProducts.length} results for &quot;{searchTerm}
              &quot;
            </div>
          )}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Owner</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.length > 0 ? (
            currentItems.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>${product.price.toLocaleString()}</TableCell>
                <TableCell>{product.user.name}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                No products found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total (Current Page)</TableCell>
            <TableCell colSpan={2} className="text-right">
              ${totalPrice.toLocaleString()}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {totalPages > 0 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {paginationRange.map((pageNumber, index) => (
                <PaginationItem key={index}>
                  {pageNumber === "..." ? (
                    <span className="px-4 py-2">...</span>
                  ) : (
                    <PaginationLink
                      onClick={() => handlePageChange(pageNumber as number)}
                      isActive={currentPage === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500 text-center">
        Showing {filteredProducts.length > 0 ? indexOfFirstItem + 1 : 0} to{" "}
        {Math.min(indexOfLastItem, filteredProducts.length)} of{" "}
        {filteredProducts.length} entries
      </div>
    </div>
  );
}
