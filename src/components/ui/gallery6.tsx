import { ArrowLeft, ArrowRight, Filter, Share2, FileText, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
interface GalleryItem {
  id: string;
  title: string;
  summary: string;
  dateRange?: string;
  url: string;
  image: string;
  slug: string;
  type?: 'Initiative' | 'Referendum';
  pdf?: string;
  level?: string;
}
interface Gallery6Props {
  heading?: string;
  items?: GalleryItem[];
  availableLevels?: string[];
}
const Gallery6 = ({
  heading = "Gallery",
  items = [],
  availableLevels = []
}: Gallery6Props) => {
  const {
    toast
  } = useToast();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [filter, setFilter] = useState<"all" | "Initiative" | "Referendum">("all");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

  // Filter items based on selected filter and levels
  const filteredItems = items.filter(item => {
    const typeMatch = filter === "all" || item.type === filter;
    const levelMatch = selectedLevels.length === 0 || selectedLevels.includes(item.level || "");
    return typeMatch && levelMatch;
  });
  
  const toggleLevel = (level: string) => {
    setSelectedLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const clearAllFilters = () => {
    setSelectedLevels([]);
    setFilter("all");
  };

  const handleShare = async (item: GalleryItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const title = item.title;
      const path = `/volksbegehren/${item.slug}`;
      const url = `${window.location.origin}${path}`;
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `Unterstütze: ${title}`,
          url
        });
        toast({
          title: "Geteilt",
          description: "Freigabedialog geöffnet."
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link kopiert",
          description: url
        });
      }
    } catch (e: any) {
      toast({
        title: "Teilen fehlgeschlagen",
        description: e?.message ?? "Unbekannter Fehler",
        variant: "destructive"
      });
    }
  };
  useEffect(() => {
    if (!carouselApi) {
      return;
    }
    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
    };
    updateSelection();
    carouselApi.on("select", updateSelection);
    return () => {
      carouselApi.off("select", updateSelection);
    };
  }, [carouselApi]);
  return <section className="py-32 bg-muted/50">
      <div className="container">
        <div className="mb-8 flex flex-col justify-between md:mb-14 md:flex-row md:items-end lg:mb-16">
          <div>
            <h2 className="mb-3 text-3xl font-semibold md:mb-4 md:text-4xl lg:mb-6">
              {heading}
            </h2>
            
            {/* Level Tags Filter */}
            {availableLevels.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {availableLevels.map(level => (
                    <Badge
                      key={level}
                      variant={selectedLevels.includes(level) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-accent text-sm px-3 py-1"
                      onClick={() => toggleLevel(level)}
                    >
                      {level}
                    </Badge>
                  ))}
                </div>
                
                {(selectedLevels.length > 0 || filter !== "all") && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {filteredItems.length} von {items.length} Einträgen
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Filter zurücksetzen
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mt-8 flex shrink-0 items-center justify-start gap-2">
            <Button size="icon" variant="outline" onClick={() => {
            carouselApi?.scrollPrev();
          }} disabled={!canScrollPrev} className="disabled:pointer-events-auto" aria-label="Previous page">
              <ArrowLeft className="size-5" />
            </Button>
            <Button size="icon" variant="outline" onClick={() => {
            carouselApi?.scrollNext();
          }} disabled={!canScrollNext} className="disabled:pointer-events-auto" aria-label="Next page">
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full">
        <Carousel setApi={setCarouselApi} opts={{
        breakpoints: {
          "(max-width: 768px)": {
            dragFree: true
          }
        }
      }} className="relative left-[-1rem]">
          <CarouselContent className="-mr-4 ml-8 2xl:ml-[max(8rem,calc(50vw-700px+1rem))] 2xl:mr-[max(0rem,calc(50vw-700px-1rem))]">
            {filteredItems.map(item => <CarouselItem key={item.id} className="pl-4 md:max-w-[400px]">
                <div className="bg-card border border-border rounded-lg p-6 shadow-sm h-full flex flex-col justify-between min-h-[280px]">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold text-foreground leading-tight flex-1">
                        {item.title}
                      </h3>
                      {item.level && (
                        <Badge variant="outline" className="ml-3 whitespace-nowrap">
                          {item.level}
                        </Badge>
                      )}
                    </div>
                    {item.dateRange && <div className="text-xs font-medium text-muted-foreground mb-3 px-2 py-1 bg-muted/30 rounded inline-block">
                        {item.dateRange}
                      </div>}
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                      {item.summary}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={e => handleShare(item, e)} className="flex items-center gap-1 hover:bg-accent text-xs">
                        <Share2 className="h-3 w-3" />
                        Teilen
                      </Button>
                    </div>
                     <a href={item.url} className="inline-flex items-center justify-center rounded-md border border-[#13678A] w-10 h-10 hover:bg-[#13678A]/10 transition-colors group" aria-label={`View details for ${item.title}`}>
                       <ArrowRight className="h-4 w-4 text-[#13678A] transition-transform group-hover:translate-x-0.5" />
                     </a>
                  </div>
                </div>
              </CarouselItem>)}
          </CarouselContent>
        </Carousel>
      </div>
    </section>;
};
export { Gallery6 };