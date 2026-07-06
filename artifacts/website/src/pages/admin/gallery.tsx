import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useAdminListGalleryAlbums,
  useAdminCreateGalleryAlbum,
  useAdminUpdateGalleryAlbum,
  useAdminDeleteGalleryAlbum,
  getAdminListGalleryAlbumsQueryKey,
  useAdminListGalleryMedia,
  useAdminCreateGalleryMedia,
  useAdminUpdateGalleryMedia,
  useAdminDeleteGalleryMedia,
  getAdminListGalleryMediaQueryKey,
  type GalleryAlbum,
  type GalleryMedia,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { CONTENT_WRITE, useCanWrite } from "@/lib/permissions";

const albumSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
  published: z.boolean(),
});
type AlbumForm = z.infer<typeof albumSchema>;

function AlbumDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: GalleryAlbum | null;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<AlbumForm>({
    resolver: zodResolver(albumSchema),
    defaultValues: editing
      ? {
          title: editing.title,
          description: editing.description ?? "",
          coverImageUrl: editing.coverImageUrl ?? "",
          published: editing.published,
        }
      : { title: "", description: "", coverImageUrl: "", published: true },
  });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.reset({
        title: editing.title,
        description: editing.description ?? "",
        coverImageUrl: editing.coverImageUrl ?? "",
        published: editing.published,
      });
    } else {
      form.reset({ title: "", description: "", coverImageUrl: "", published: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getAdminListGalleryAlbumsQueryKey() });

  const createMutation = useAdminCreateGalleryAlbum({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Album created" });
        onOpenChange(false);
      },
      onError: (error: unknown) =>
        toast({ title: "Failed to save", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
    },
  });
  const updateMutation = useAdminUpdateGalleryAlbum({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Album updated" });
        onOpenChange(false);
      },
      onError: (error: unknown) =>
        toast({ title: "Failed to save", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
    },
  });

  function onSubmit(values: AlbumForm) {
    const payload = {
      title: values.title,
      description: values.description || undefined,
      coverImageUrl: values.coverImageUrl || undefined,
      published: values.published,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Album" : "New Album"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input data-testid="input-album-title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} data-testid="input-album-description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input data-testid="input-album-cover" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border border-border p-3">
                  <FormLabel className="mb-0">Published</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-album-published" />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending} data-testid="button-save-album">
                {isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function AlbumsTab({ onManageMedia }: { onManageMedia: (album: GalleryAlbum) => void }) {
  const { data, isLoading } = useAdminListGalleryAlbums();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const canWrite = useCanWrite(CONTENT_WRITE);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryAlbum | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteMutation = useAdminDeleteGalleryAlbum({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListGalleryAlbumsQueryKey() });
        toast({ title: "Album deleted" });
        setDeleteId(null);
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        {canWrite && (
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            data-testid="button-add-album"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Album
          </Button>
        )}
      </div>
      <Card className="border-card-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (data ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No albums yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  (data ?? []).map((row) => (
                    <TableRow key={row.id} data-testid={`row-album-${row.id}`}>
                      <TableCell className="font-medium">{row.title}</TableCell>
                      <TableCell>
                        <Badge variant={row.published ? "default" : "secondary"}>
                          {row.published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onManageMedia(row)}
                          data-testid={`button-manage-media-${row.id}`}
                        >
                          Manage Media
                        </Button>
                        {canWrite && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setEditing(row);
                                setDialogOpen(true);
                              }}
                              data-testid={`button-edit-album-${row.id}`}
                              aria-label={`Edit album ${row.title}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteId(row.id)}
                              data-testid={`button-delete-album-${row.id}`}
                              aria-label={`Delete album ${row.title}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlbumDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete album?</AlertDialogTitle>
            <AlertDialogDescription>
              This will also delete all media in this album. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const mediaSchema = z.object({
  albumId: z.string().min(1, "Album is required"),
  mediaUrl: z.string().min(1, "Media URL is required"),
  caption: z.string().optional(),
  sortOrder: z.coerce.number().int(),
});
type MediaForm = z.infer<typeof mediaSchema>;

function MediaDialog({
  open,
  onOpenChange,
  editing,
  albums,
  defaultAlbumId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: GalleryMedia | null;
  albums: GalleryAlbum[];
  defaultAlbumId: string;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<MediaForm>({
    resolver: zodResolver(mediaSchema),
    defaultValues: editing
      ? {
          albumId: editing.albumId,
          mediaUrl: editing.mediaUrl,
          caption: editing.caption ?? "",
          sortOrder: editing.sortOrder,
        }
      : { albumId: defaultAlbumId, mediaUrl: "", caption: "", sortOrder: 0 },
  });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.reset({
        albumId: editing.albumId,
        mediaUrl: editing.mediaUrl,
        caption: editing.caption ?? "",
        sortOrder: editing.sortOrder,
      });
    } else {
      form.reset({ albumId: defaultAlbumId, mediaUrl: "", caption: "", sortOrder: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, defaultAlbumId]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getAdminListGalleryMediaQueryKey() });

  const createMutation = useAdminCreateGalleryMedia({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Media added" });
        onOpenChange(false);
      },
      onError: (error: unknown) =>
        toast({ title: "Failed to save", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
    },
  });
  const updateMutation = useAdminUpdateGalleryMedia({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Media updated" });
        onOpenChange(false);
      },
      onError: (error: unknown) =>
        toast({ title: "Failed to save", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
    },
  });

  function onSubmit(values: MediaForm) {
    const payload = {
      albumId: values.albumId,
      mediaUrl: values.mediaUrl,
      caption: values.caption || undefined,
      sortOrder: values.sortOrder,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Media" : "Add Media"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="albumId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Album</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger data-testid="select-media-album">
                        <SelectValue placeholder="Select album" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {albums.map((album) => (
                        <SelectItem key={album.id} value={album.id}>
                          {album.title}
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
              name="mediaUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Media URL</FormLabel>
                  <FormControl>
                    <Input data-testid="input-media-url" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caption (optional)</FormLabel>
                  <FormControl>
                    <Input data-testid="input-media-caption" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input type="number" data-testid="input-media-sort-order" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending} data-testid="button-save-media">
                {isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function MediaTab({ albums }: { albums: GalleryAlbum[] }) {
  const { data, isLoading } = useAdminListGalleryMedia();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const canWrite = useCanWrite(CONTENT_WRITE);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryMedia | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterAlbumId, setFilterAlbumId] = useState<string>("all");

  const deleteMutation = useAdminDeleteGalleryMedia({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListGalleryMediaQueryKey() });
        toast({ title: "Media deleted" });
        setDeleteId(null);
      },
    },
  });

  const albumTitle = (id: string) => albums.find((a) => a.id === id)?.title ?? "Unknown album";
  const filtered = (data ?? []).filter((row) => filterAlbumId === "all" || row.albumId === filterAlbumId);
  const sorted = [...filtered].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <Select value={filterAlbumId} onValueChange={setFilterAlbumId}>
          <SelectTrigger className="w-56" data-testid="select-filter-album">
            <SelectValue placeholder="All albums" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All albums</SelectItem>
            {albums.map((album) => (
              <SelectItem key={album.id} value={album.id}>
                {album.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canWrite && (
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            disabled={albums.length === 0}
            data-testid="button-add-media"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Media
          </Button>
        )}
      </div>
      <Card className="border-card-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Album</TableHead>
                  <TableHead>Caption</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No media yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  sorted.map((row) => (
                    <TableRow key={row.id} data-testid={`row-media-${row.id}`}>
                      <TableCell>
                        <img src={row.mediaUrl} alt={row.caption ?? ""} className="h-12 w-16 object-cover rounded" />
                      </TableCell>
                      <TableCell>{albumTitle(row.albumId)}</TableCell>
                      <TableCell>{row.caption ?? "—"}</TableCell>
                      <TableCell>{row.sortOrder}</TableCell>
                      <TableCell className="text-right space-x-1">
                        {canWrite && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setEditing(row);
                                setDialogOpen(true);
                              }}
                              data-testid={`button-edit-media-${row.id}`}
                              aria-label={`Edit media ${row.caption ?? row.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteId(row.id)}
                              data-testid={`button-delete-media-${row.id}`}
                              aria-label={`Delete media ${row.caption ?? row.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <MediaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        albums={albums}
        defaultAlbumId={filterAlbumId !== "all" ? filterAlbumId : albums[0]?.id ?? ""}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete media?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminGalleryPage() {
  const { data: albums } = useAdminListGalleryAlbums();
  const [tab, setTab] = useState("albums");

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-3xl mb-2">Gallery</h1>
        <p className="text-muted-foreground">Manage photo albums and media shown on the public Gallery page.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="albums" data-testid="tab-albums">Albums</TabsTrigger>
          <TabsTrigger value="media" data-testid="tab-media">Media</TabsTrigger>
        </TabsList>
        <TabsContent value="albums">
          <AlbumsTab onManageMedia={() => setTab("media")} />
        </TabsContent>
        <TabsContent value="media">
          <MediaTab albums={albums ?? []} />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
