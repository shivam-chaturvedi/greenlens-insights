import { useMemo, useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { fetchPhotos, Photo } from "@/lib/photos";
import { Search, ChevronLeft, ChevronRight, X, Image as ImageIcon, ZoomIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const PhotoSkeleton = () => (
  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
    <Skeleton className="w-full aspect-[4/3]" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);

const Photos = () => {
  const {
    data: photos = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["photos"],
    queryFn: fetchPhotos,
    refetchOnWindowFocus: false,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const filteredPhotos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return photos;
    return photos.filter((photo) => photo.caption.toLowerCase().includes(term));
  }, [photos, searchTerm]);

  const activePhoto = selectedIndex !== null && filteredPhotos[selectedIndex] ? filteredPhotos[selectedIndex] : null;

  const handlePrev = () => {
    if (selectedIndex === null || filteredPhotos.length === 0) return;
    setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : filteredPhotos.length - 1));
  };

  const handleNext = () => {
    if (selectedIndex === null || filteredPhotos.length === 0) return;
    setSelectedIndex((prev) => (prev! < filteredPhotos.length - 1 ? prev! + 1 : 0));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") setSelectedIndex(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, filteredPhotos.length]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="space-y-4 max-w-3xl">
            <span className="text-xs uppercase tracking-widest font-bold text-primary px-3 py-1 bg-primary/10 rounded-full inline-block">
              Visual Showcase
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground font-display">
              Photo Gallery
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Explore real-world sustainability initiatives, community accomplishments, partner highlights, and testimonials from across our ecosystem.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search photos by caption, business name, or topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-card border-border shadow-sm focus-visible:ring-primary"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Showing {filteredPhotos.length} {filteredPhotos.length === 1 ? "photo" : "photos"}
            </div>
          </div>

          {/* Gallery Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <PhotoSkeleton key={idx} />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-12 text-center space-y-3">
              <p className="text-destructive font-semibold text-lg">Unable to load photo gallery</p>
              <p className="text-sm text-muted-foreground">
                {(error as Error)?.message || "An unexpected error occurred while fetching photos."}
              </p>
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-16 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">No photos found</h3>
                <p className="text-muted-foreground max-w-md mx-auto text-sm">
                  {searchTerm
                    ? `No photos matched your search "${searchTerm}". Try a different keyword.`
                    : "No photos have been uploaded to the gallery yet. Check back soon!"}
                </p>
              </div>
              {searchTerm && (
                <Button variant="outline" size="sm" onClick={() => setSearchTerm("")} className="mt-2">
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
              {filteredPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                >
                  {/* Photo Container */}
                  <div
                    onClick={() => setSelectedIndex(index)}
                    className="relative aspect-[4/3] bg-muted overflow-hidden cursor-pointer select-none"
                  >
                    <img
                      src={photo.publicUrl}
                      alt={photo.caption || "Gallery photo"}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white">
                      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold">
                        <ZoomIn className="w-4 h-4" />
                        <span>View Photo</span>
                      </div>
                    </div>
                  </div>

                  {/* Caption Section Directly Below Photo */}
                  <div className="p-4 flex-1 flex flex-col justify-between bg-card border-t border-border/50">
                    <p className="text-sm font-medium text-foreground leading-relaxed break-words">
                      {photo.caption || <span className="italic text-muted-foreground">No caption provided</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Lightbox / Preview Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="relative max-w-5xl w-full flex flex-col items-center max-h-[90vh]">
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between text-white/80 pb-4">
              <span className="text-xs font-medium uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full">
                Photo {selectedIndex! + 1} of {filteredPhotos.length}
              </span>
              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition focus:outline-none"
                aria-label="Close photo preview"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Photo View */}
            <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden rounded-2xl bg-black/40 border border-white/10">
              <img
                src={activePhoto.publicUrl}
                alt={activePhoto.caption || "Full size photo"}
                className="max-h-[70vh] w-auto max-w-full object-contain select-none"
              />

              {/* Prev / Next Controls */}
              {filteredPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all focus:outline-none"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all focus:outline-none"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Caption directly below image in Lightbox */}
            {activePhoto.caption && (
              <div className="w-full bg-black/60 border border-white/10 rounded-xl p-4 mt-4 text-center">
                <p className="text-sm sm:text-base font-medium text-white/90 max-w-3xl mx-auto leading-relaxed">
                  {activePhoto.caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Photos;
