import { useState } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useListGalleryAlbumsPublic,
  useListGalleryMediaPublic,
  type GalleryAlbum,
} from "@workspace/api-client-react";
import { ArrowLeft, Images } from "lucide-react";

function AlbumGrid({ onSelect }: { onSelect: (album: GalleryAlbum) => void }) {
  const { data, isLoading } = useListGalleryAlbumsPublic();

  if (isLoading) {
    return <p className="text-center text-muted-foreground">Loading...</p>;
  }
  if (!data || data.length === 0) {
    return <p className="text-center text-muted-foreground">No albums published yet.</p>;
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((album) => (
        <Card
          key={album.id}
          className="border-card-border overflow-hidden flex flex-col cursor-pointer hover-elevate"
          onClick={() => onSelect(album)}
          data-testid={`card-album-${album.id}`}
        >
          {album.coverImageUrl ? (
            <img src={album.coverImageUrl} alt={album.title} className="h-48 w-full object-cover" />
          ) : (
            <div className="h-48 w-full bg-muted flex items-center justify-center">
              <Images className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <CardContent className="py-5 flex-1">
            <p className="font-serif text-lg mb-1">{album.title}</p>
            {album.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{album.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AlbumView({ album, onBack }: { album: GalleryAlbum; onBack: () => void }) {
  const { data, isLoading } = useListGalleryMediaPublic({ albumId: album.id });
  const sorted = [...(data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-6" data-testid="button-back-to-albums">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Albums
      </Button>
      <div className="mb-8">
        <h2 className="font-serif text-2xl mb-2">{album.title}</h2>
        {album.description && <p className="text-muted-foreground">{album.description}</p>}
      </div>
      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading...</p>
      ) : sorted.length === 0 ? (
        <p className="text-center text-muted-foreground">No media in this album yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((media) => (
            <figure key={media.id} className="rounded-md overflow-hidden border border-card-border" data-testid={`media-${media.id}`}>
              <img src={media.mediaUrl} alt={media.caption ?? album.title} className="w-full h-56 object-cover" />
              {media.caption && (
                <figcaption className="text-xs text-muted-foreground p-2">{media.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GalleryPage() {
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="font-serif text-3xl md:text-4xl">Gallery</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Photos from events, classes, and community life at Grays Park Masjid.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          {selectedAlbum ? (
            <AlbumView album={selectedAlbum} onBack={() => setSelectedAlbum(null)} />
          ) : (
            <AlbumGrid onSelect={setSelectedAlbum} />
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
