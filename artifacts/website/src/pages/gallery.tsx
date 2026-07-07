import { useState } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import {
  useListGalleryAlbumsPublic,
  useListGalleryMediaPublic,
  type GalleryAlbum,
} from "@workspace/api-client-react";
import { ArrowLeft, Images } from "lucide-react";
import { IslamicPattern, IslamicStar } from "@/components/site/islamic-pattern";

function AlbumGrid({ onSelect }: { onSelect: (album: GalleryAlbum) => void }) {
  const { data, isLoading } = useListGalleryAlbumsPublic();
  if (isLoading) return <p className="text-center text-muted-foreground py-16">Loading albums…</p>;
  if (!data || data.length === 0) return (
    <div className="rounded-2xl border border-dashed border-border py-16 text-center">
      <Images className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
      <p className="text-muted-foreground">No albums published yet.</p>
    </div>
  );
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((album) => (
        <div
          key={album.id}
          className="group relative overflow-hidden rounded-2xl border border-card-border bg-card cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-300"
          onClick={() => onSelect(album)}
          data-testid={`card-album-${album.id}`}
        >
          {album.coverImageUrl ? (
            <div className="h-48 overflow-hidden">
              <img src={album.coverImageUrl} alt={album.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          ) : (
            <div className="h-48 bg-primary/5 flex items-center justify-center relative overflow-hidden">
              <IslamicPattern className="absolute inset-0 text-primary/10 [background-size:40px_40px]" />
              <Images className="h-10 w-10 text-primary/30 relative" />
            </div>
          )}
          <div className="p-5">
            <p className="font-serif text-lg mb-1.5">{album.title}</p>
            {album.description && <p className="text-sm text-muted-foreground leading-relaxed">{album.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function AlbumView({ album, onBack }: { album: GalleryAlbum; onBack: () => void }) {
  const { data, isLoading } = useListGalleryMediaPublic({ albumId: album.id });
  const sorted = [...(data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-6 gap-2" data-testid="button-back-to-albums">
        <ArrowLeft className="h-4 w-4" />
        Back to Albums
      </Button>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
          <h2 className="font-serif text-3xl">{album.title}</h2>
        </div>
        {album.description && <p className="text-muted-foreground ml-8">{album.description}</p>}
      </div>
      {isLoading ? (
        <p className="text-center text-muted-foreground py-16">Loading…</p>
      ) : sorted.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No media in this album yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((media) => (
            <figure key={media.id} className="group rounded-xl overflow-hidden border border-card-border" data-testid={`media-${media.id}`}>
              <div className="overflow-hidden h-56">
                <img src={media.mediaUrl} alt={media.caption ?? album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              {media.caption && (
                <figcaption className="text-xs text-muted-foreground p-3 bg-card">{media.caption}</figcaption>
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

        {/* Hero */}
        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
          <IslamicStar className="absolute -top-10 -right-10 w-56 h-56 text-white/5" />
          <IslamicStar className="absolute -bottom-10 -left-10 w-48 h-48 text-white/5" />
          <div className="relative mx-auto max-w-4xl px-6 py-16 md:py-20 text-center">
            <h1 className="font-serif text-4xl md:text-5xl">Gallery</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              Photos from events, classes, and community life at Grays Park Masjid.
            </p>
          </div>
        </section>

        {/* Gallery content */}
        <section className="mx-auto max-w-6xl px-6 py-14 md:py-16">
          {!selectedAlbum && (
            <div className="flex items-center gap-3 mb-8">
              <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
              <h2 className="font-serif text-3xl">Photo Albums</h2>
            </div>
          )}
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
