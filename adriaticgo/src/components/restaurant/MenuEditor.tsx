"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
  categoryId: string;
}

interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  items: MenuItem[];
}

interface Restaurant {
  id: string;
  name: string;
  categories: MenuCategory[];
}

interface MenuEditorProps {
  restaurants: Restaurant[];
  onRefresh: () => void;
}

export function MenuEditor({ restaurants, onRefresh }: MenuEditorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(restaurants.flatMap((r) => r.categories.map((c) => c.id)))
  );
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(
    restaurants[0]?.id ?? null
  );
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(
    null
  );
  const [itemForm, setItemForm] = useState({
    categoryId: "",
    name: "",
    description: "",
    price: "",
  });
  const [categoryForm, setCategoryForm] = useState({ name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentRestaurant = restaurants.find((r) => r.id === selectedRestaurant);

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openAddItem = (categoryId: string) => {
    setEditingItem(null);
    setItemForm({
      categoryId,
      name: "",
      description: "",
      price: "",
    });
    setItemDialogOpen(true);
    setError(null);
  };

  const openEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description ?? "",
      price: item.price.toString(),
    });
    setItemDialogOpen(true);
    setError(null);
  };

  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "" });
    setCategoryDialogOpen(true);
    setError(null);
  };

  const openEditCategory = (cat: MenuCategory) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name });
    setCategoryDialogOpen(true);
    setError(null);
  };

  const handleSaveItem = async () => {
    setLoading(true);
    setError(null);
    try {
      const price = parseFloat(itemForm.price);
      if (isNaN(price) || price <= 0) {
        setError("Please enter a valid price");
        return;
      }
      if (!itemForm.name.trim()) {
        setError("Name is required");
        return;
      }
      const body = {
        categoryId: itemForm.categoryId,
        name: itemForm.name.trim(),
        description: itemForm.description.trim() || undefined,
        price,
      };
      if (editingItem) {
        const res = await fetch(`/api/menu-items/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to update");
        }
      } else {
        const res = await fetch("/api/menu-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to create");
        }
      }
      setItemDialogOpen(false);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/menu-items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      onRefresh();
    } catch {
      setError("Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/menu-items/${item.id}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      if (!res.ok) throw new Error("Failed to update");
      onRefresh();
    } catch {
      setError("Failed to update availability");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!selectedRestaurant || !categoryForm.name.trim()) {
      setError("Name is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (editingCategory) {
        const res = await fetch(`/api/menu-categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: categoryForm.name.trim() }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to update");
        }
      } else {
        const res = await fetch("/api/menu-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurantId: selectedRestaurant,
            name: categoryForm.name.trim(),
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to create");
        }
      }
      setCategoryDialogOpen(false);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category and all its items?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/menu-categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      onRefresh();
    } catch {
      setError("Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  if (restaurants.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No restaurants found. You need to be assigned as an owner.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {restaurants.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {restaurants.map((r) => (
            <Button
              key={r.id}
              variant={selectedRestaurant === r.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRestaurant(r.id)}
            >
              {r.name}
            </Button>
          ))}
        </div>
      )}

      {currentRestaurant && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{currentRestaurant.name}</h2>
            <Button size="sm" onClick={openAddCategory} className="gap-1">
              <Plus className="size-3.5" />
              Add Category
            </Button>
          </div>

          <div className="space-y-2">
            {currentRestaurant.categories
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((category) => (
                <Card key={category.id} size="sm">
                  <CardHeader
                    className="flex flex-row items-center gap-2 cursor-pointer py-3"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {expandedCategories.has(category.id) ? (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-4 text-muted-foreground" />
                    )}
                    <span className="font-medium flex-1">{category.name}</span>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditCategory(category);
                      }}
                    >
                      <Pencil className="size-3" />
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                      disabled={loading}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddItem(category.id);
                      }}
                      className="gap-1"
                    >
                      <Plus className="size-3" />
                      Item
                    </Button>
                  </CardHeader>
                  {expandedCategories.has(category.id) && (
                    <CardContent className="pt-0 space-y-2 pl-6">
                      {category.items
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-4 py-2 border-b last:border-0"
                          >
                            <div className="min-w-0 flex-1">
                              <p
                                className={
                                  !item.isAvailable
                                    ? "text-muted-foreground line-through"
                                    : ""
                                }
                              >
                                {item.name}
                              </p>
                              {item.description && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-medium">
                                {formatCurrency(item.price)}
                              </span>
                              <Button
                                size="sm"
                                variant={
                                  item.isAvailable ? "secondary" : "default"
                                }
                                onClick={() => handleToggleAvailability(item)}
                                disabled={loading}
                              >
                                {item.isAvailable ? "Available" : "Sold Out"}
                              </Button>
                              <Button
                                size="icon-xs"
                                variant="ghost"
                                onClick={() => openEditItem(item)}
                              >
                                <Pencil className="size-3" />
                              </Button>
                              <Button
                                size="icon-xs"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteItem(item.id)}
                                disabled={loading}
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      {category.items.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4">
                          No items. Add one with the + Item button.
                        </p>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
          </div>
        </>
      )}

      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="item-name">Name</Label>
              <Input
                id="item-name"
                value={itemForm.name}
                onChange={(e) =>
                  setItemForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Margherita Pizza"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="item-desc">Description (optional)</Label>
              <Textarea
                id="item-desc"
                value={itemForm.description}
                onChange={(e) =>
                  setItemForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Brief description..."
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="item-price">Price (€)</Label>
              <Input
                id="item-price"
                type="number"
                step="0.01"
                min="0"
                value={itemForm.price}
                onChange={(e) =>
                  setItemForm((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="9.99"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setItemDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveItem} disabled={loading}>
              {editingItem ? "Save" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cat-name">Category Name</Label>
              <Input
                id="cat-name"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Starters, Main Courses"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCategoryDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCategory} disabled={loading}>
              {editingCategory ? "Save" : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
