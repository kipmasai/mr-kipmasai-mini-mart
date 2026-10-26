import type { Product } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import {
  useCategories,
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "@/hooks/useQueries";
import { formatSen, ringgitToSen, senToRinggitInput } from "@/lib/currency";
import { ExternalBlob } from "@caffeineai/object-storage";
import {
  AlertTriangle,
  ImagePlus,
  Loader2,
  Package,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { type ChangeEvent, type FormEvent, useRef, useState } from "react";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/webp,image/gif";

interface FormState {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
};

type Feedback = { kind: "success" | "error"; message: string } | null;

function productToForm(product: Product): FormState {
  return {
    name: product.name,
    description: product.description,
    price: senToRinggitInput(product.priceSen),
    category: product.category,
    stock: product.stock.toString(),
  };
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function AdminProductsPage() {
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: products, isLoading, isError, refetch } = useProducts();
  const { data: categories } = useCategories();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saving = createProduct.isPending || updateProduct.isPending;

  function resetForm() {
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(null);
    setFormError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function openCreate() {
    setEditing(null);
    resetForm();
    setDialogOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setForm(productToForm(product));
    setImageFile(null);
    setImagePreview(product.image ? product.image.getDirectURL() : null);
    setUploadProgress(null);
    setFormError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setDialogOpen(true);
  }

  function handleDialogChange(open: boolean) {
    setDialogOpen(open);
    if (!open) resetForm();
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!isImageFile(file)) {
      setFormError("Please choose an image file (PNG, JPG, WEBP or GIF).");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setFormError("Image must be 5 MB or smaller.");
      return;
    }
    setFormError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function buildImageBlob(): Promise<ExternalBlob | undefined> {
    if (!imageFile) return undefined;
    const bytes = new Uint8Array(await imageFile.arrayBuffer());
    return ExternalBlob.fromBytes(
      bytes,
      imageFile.type,
      imageFile.name,
    ).withUploadProgress((pct) => setUploadProgress(pct));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const name = form.name.trim();
    const description = form.description.trim();
    const category = form.category.trim();
    const priceSen = ringgitToSen(form.price);
    const stock = Number.parseInt(form.stock, 10);

    if (name === "") {
      setFormError("Product name is required.");
      return;
    }
    if (priceSen === null || priceSen <= 0n) {
      setFormError("Enter a valid price in RM, for example 8.90.");
      return;
    }
    if (category === "") {
      setFormError("Category is required.");
      return;
    }
    if (!Number.isFinite(stock) || stock < 0) {
      setFormError("Stock must be zero or a positive whole number.");
      return;
    }

    try {
      const image = await buildImageBlob();
      if (editing) {
        await updateProduct.mutateAsync({
          id: editing.id,
          input: {
            name,
            description,
            category,
            stock: BigInt(stock),
            priceSen,
            ...(image ? { image } : {}),
          },
        });
        setFeedback({
          kind: "success",
          message: `Updated “${name}”.`,
        });
      } else {
        await createProduct.mutateAsync({
          name,
          description,
          category,
          stock: BigInt(stock),
          priceSen,
          ...(image ? { image } : {}),
        });
        setFeedback({
          kind: "success",
          message: `Added “${name}” to the catalogue.`,
        });
      }
      setDialogOpen(false);
      resetForm();
    } catch {
      setFormError(
        "Could not save the product. Check your details and try again.",
      );
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    try {
      await deleteProduct.mutateAsync(target.id);
      setFeedback({
        kind: "success",
        message: `Removed “${target.name}” from the catalogue.`,
      });
    } catch {
      setFeedback({
        kind: "error",
        message: `Could not delete “${target.name}”. Please try again.`,
      });
    } finally {
      setPendingDelete(null);
    }
  }

  if (isAdminLoading) {
    return (
      <section
        data-ocid="admin_products.page"
        className="mx-auto w-full max-w-6xl px-4 py-12"
      >
        <output
          data-ocid="admin_products.loading_state"
          className="flex items-center gap-3 text-muted-foreground"
        >
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          Checking your access…
        </output>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section
        data-ocid="admin_products.page"
        className="mx-auto w-full max-w-6xl px-4 py-16"
      >
        <div
          data-ocid="admin_products.access_denied_state"
          className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-subtle"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-7" aria-hidden="true" />
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Admins only
          </h1>
          <p className="text-sm text-muted-foreground">
            This area manages the store catalogue. Sign in with an administrator
            account to continue.
          </p>
        </div>
      </section>
    );
  }

  const productList = products ?? [];

  return (
    <section
      data-ocid="admin_products.page"
      className="mx-auto w-full max-w-6xl px-4 py-10"
    >
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Store management
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
            Products
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add, edit and remove the items shoppers see in the mart.
          </p>
        </div>
        <Button
          type="button"
          data-ocid="admin_products.add_button"
          onClick={openCreate}
          className="rounded-full bg-primary px-5 text-primary-foreground shadow-subtle transition-smooth hover:bg-primary/90"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add product
        </Button>
      </header>

      {feedback && (
        <output
          data-ocid={
            feedback.kind === "success"
              ? "admin_products.success_state"
              : "admin_products.error_state"
          }
          className={`mt-6 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
            feedback.kind === "success"
              ? "border-success/30 bg-success/10 text-foreground"
              : "border-destructive/30 bg-destructive/10 text-foreground"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            data-ocid="admin_products.feedback_close_button"
            aria-label="Dismiss message"
            onClick={() => setFeedback(null)}
            className="shrink-0 rounded-full p-1 text-muted-foreground transition-smooth hover:bg-background hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </output>
      )}

      <div className="mt-6">
        {isLoading ? (
          <div
            data-ocid="admin_products.loading_state"
            className="space-y-3"
            aria-busy="true"
          >
            {Array.from({ length: 4 }, (_, i) => `admin-skeleton-${i}`).map(
              (id) => (
                <Skeleton key={id} className="h-20 w-full rounded-xl" />
              ),
            )}
          </div>
        ) : isError ? (
          <div
            data-ocid="admin_products.error_state"
            className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-12 text-center"
          >
            <AlertTriangle
              className="size-8 text-destructive"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              We could not load the catalogue.
            </p>
            <Button
              type="button"
              variant="outline"
              data-ocid="admin_products.retry_button"
              onClick={() => void refetch()}
              className="rounded-full"
            >
              Try again
            </Button>
          </div>
        ) : productList.length === 0 ? (
          <div
            data-ocid="admin_products.empty_state"
            className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
              <Package className="size-7" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                No products yet
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first item to start filling the shelves.
              </p>
            </div>
            <Button
              type="button"
              data-ocid="admin_products.empty_add_button"
              onClick={openCreate}
              className="rounded-full bg-primary px-5 text-primary-foreground"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add product
            </Button>
          </div>
        ) : (
          <ul
            data-ocid="admin_products.list"
            className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-subtle"
          >
            {productList.map((product, index) => (
              <li
                key={product.id.toString()}
                data-ocid={`admin_products.item.${index + 1}`}
                className="flex flex-col gap-4 p-4 transition-smooth hover:bg-secondary/40 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary">
                    {product.image ? (
                      <img
                        src={product.image.getDirectURL()}
                        alt={product.name}
                        className="size-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <Package
                        className="size-6 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-semibold text-foreground">
                      {product.name}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {product.category}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="font-price rounded-full bg-accent/15 px-2.5 py-0.5 text-sm font-semibold text-accent">
                        {formatSen(product.priceSen)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          product.stock > 0n
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {product.stock > 0n
                          ? `${product.stock.toString()} in stock`
                          : "Out of stock"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:pl-4">
                  <Button
                    type="button"
                    variant="outline"
                    data-ocid={`admin_products.edit_button.${index + 1}`}
                    onClick={() => openEdit(product)}
                    className="rounded-full"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    data-ocid={`admin_products.delete_button.${index + 1}`}
                    onClick={() => setPendingDelete(product)}
                    className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent
          data-ocid="admin_products.form_dialog"
          className="max-h-[90dvh] overflow-y-auto sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              {editing ? "Edit product" : "Add product"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the details shoppers see for this item."
                : "Fill in the details to add a new item to the catalogue."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Name</Label>
              <Input
                id="product-name"
                data-ocid="admin_products.name_input"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Kampung Free-Range Eggs (10s)"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-description">Description</Label>
              <Textarea
                id="product-description"
                data-ocid="admin_products.description_input"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="A short description of the item."
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-price">Price (RM)</Label>
                <Input
                  id="product-price"
                  data-ocid="admin_products.price_input"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="8.90"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-stock">Stock quantity</Label>
                <Input
                  id="product-stock"
                  data-ocid="admin_products.stock_input"
                  inputMode="numeric"
                  value={form.stock}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, stock: e.target.value }))
                  }
                  placeholder="24"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-category">Category</Label>
              <Input
                id="product-category"
                data-ocid="admin_products.category_input"
                list="admin-product-categories"
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value }))
                }
                placeholder="e.g. Fresh Produce"
                required
              />
              <datalist id="admin-product-categories">
                {(categories ?? []).map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-image">Product image</Label>
              <div className="flex items-center gap-4">
                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Selected product"
                      className="size-full object-cover"
                    />
                  ) : (
                    <ImagePlus
                      className="size-6 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    id="product-image"
                    data-ocid="admin_products.image_input"
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES}
                    onChange={handleImageChange}
                    className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-secondary file:px-4 file:py-2 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80"
                  />
                  {imagePreview && (
                    <button
                      type="button"
                      data-ocid="admin_products.image_clear_button"
                      onClick={clearImage}
                      className="self-start text-xs font-medium text-muted-foreground underline-offset-2 transition-smooth hover:text-destructive hover:underline"
                    >
                      Remove image
                    </button>
                  )}
                </div>
              </div>
              {uploadProgress !== null && uploadProgress < 100 && (
                <div
                  data-ocid="admin_products.upload_progress"
                  className="space-y-1 pt-1"
                >
                  <Progress value={uploadProgress} />
                  <p className="text-xs text-muted-foreground">
                    Uploading image… {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}
            </div>

            {formError && (
              <p
                role="alert"
                data-ocid="admin_products.form_error_state"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-foreground"
              >
                {formError}
              </p>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                data-ocid="admin_products.cancel_button"
                onClick={() => handleDialogChange(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="admin_products.submit_button"
                disabled={saving}
                className="rounded-full bg-primary px-5 text-primary-foreground"
              >
                {saving && (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                )}
                {editing ? "Save changes" : "Add product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogContent
          data-ocid="admin_products.delete_dialog"
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              Delete product?
            </DialogTitle>
            <DialogDescription>
              {pendingDelete
                ? `“${pendingDelete.name}” will be removed from the catalogue. This cannot be undone.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="admin_products.delete_cancel_button"
              onClick={() => setPendingDelete(null)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-ocid="admin_products.delete_confirm_button"
              disabled={deleteProduct.isPending}
              onClick={() => void handleConfirmDelete()}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProduct.isPending && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
