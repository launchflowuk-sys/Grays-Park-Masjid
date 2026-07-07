import { useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminCreateBlogPost,
  useAdminUpdateBlogPost,
  getAdminListBlogPostsQueryKey,
  getAdminGetBlogPostQueryOptions,
} from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { useUpload } from "@workspace/object-storage-web";
import { useToast } from "@/hooks/use-toast";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Link } from "wouter";
import { BLOG_CATEGORIES, BLOG_CATEGORY_LABELS, type BlogCategory } from "@/lib/blog-categories";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  featureImageUrl: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  authorName: z.string().optional(),
  published: z.boolean(),
});
type BlogForm = z.infer<typeof blogSchema>;

function BlogEditorInner({ id }: { id?: string }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: existing, isLoading } = useQuery({
    ...getAdminGetBlogPostQueryOptions(id ?? ""),
    enabled: isEdit,
  });

  const form = useForm<BlogForm>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featureImageUrl: "",
      category: "community",
      authorName: "",
      published: false,
    },
  });

  useEffect(() => {
    if (existing) {
      form.reset({
        title: existing.title,
        slug: existing.slug,
        excerpt: existing.excerpt ?? "",
        content: existing.content,
        featureImageUrl: existing.featureImageUrl ?? "",
        category: existing.category,
        authorName: existing.authorName ?? "",
        published: existing.published,
      });
    }
  }, [existing, form]);

  const { uploadFile, isUploading } = useUpload({
    onSuccess: (res) => {
      const publicUrl = `/api/storage/objects/${res.objectPath}`;
      form.setValue("featureImageUrl", publicUrl);
      toast({ title: "Image uploaded" });
    },
    onError: () => toast({ title: "Image upload failed", variant: "destructive" }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getAdminListBlogPostsQueryKey() });

  const createMutation = useAdminCreateBlogPost({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Blog post created" });
        navigate("/admin/blog");
      },
      onError: (error: unknown) =>
        toast({
          title: "Failed to save",
          description: error instanceof Error ? error.message : undefined,
          variant: "destructive",
        }),
    },
  });

  const updateMutation = useAdminUpdateBlogPost({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Blog post updated" });
        navigate("/admin/blog");
      },
      onError: (error: unknown) =>
        toast({
          title: "Failed to save",
          description: error instanceof Error ? error.message : undefined,
          variant: "destructive",
        }),
    },
  });

  function onSubmit(values: BlogForm) {
    const payload = {
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt || undefined,
      content: values.content,
      featureImageUrl: values.featureImageUrl || undefined,
      category: values.category,
      authorName: values.authorName || undefined,
      published: values.published,
      publishedAt: values.published ? (existing?.publishedAt ?? new Date().toISOString()) : undefined,
    };
    if (isEdit && id) {
      updateMutation.mutate({ id, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isLoading) {
    return (
      <AdminLayout>
        <p className="text-muted-foreground">Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/blog">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-serif text-3xl">{isEdit ? "Edit Post" : "New Blog Post"}</h1>
          <p className="text-muted-foreground text-sm">
            {isEdit ? "Update existing post" : "Create a new article or Islamic content"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <Card>
                <CardContent className="pt-5 space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            data-testid="input-blog-title"
                            placeholder="Post title"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              if (!isEdit) {
                                form.setValue("slug", slugify(e.target.value));
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={2}
                            data-testid="input-blog-excerpt"
                            placeholder="A short summary shown in post listings"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <TiptapEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Write your article here..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Publish</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel className="mb-0">Published</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-blog-published"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isPending}
                    data-testid="button-save-blog"
                  >
                    {isPending ? "Saving..." : isEdit ? "Update Post" : "Create Post"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Slug</FormLabel>
                        <FormControl>
                          <Input data-testid="input-blog-slug" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-blog-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BLOG_CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {BLOG_CATEGORY_LABELS[cat]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="authorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author (optional)</FormLabel>
                        <FormControl>
                          <Input data-testid="input-blog-author" placeholder="e.g. Imam Ahmad" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Feature Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {form.watch("featureImageUrl") && (
                    <div className="relative">
                      <img
                        src={form.watch("featureImageUrl")}
                        alt="Feature"
                        className="w-full aspect-video object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => form.setValue("featureImageUrl", "")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadFile(file);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full pointer-events-none"
                      disabled={isUploading}
                      asChild
                    >
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? "Uploading..." : "Upload Image"}
                      </span>
                    </Button>
                  </label>

                  <FormField
                    control={form.control}
                    name="featureImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">or paste URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://..."
                            className="text-xs"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </AdminLayout>
  );
}

export default function AdminBlogEditorPage() {
  const params = useParams<{ id?: string }>();
  return <BlogEditorInner id={params.id} />;
}
