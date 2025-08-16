import { ArrowLeft, ArrowRight, Filter, Share2, Vote, FileText } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface GalleryItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  image: string;
  slug: string;
  type?: 'Initiative' | 'Referendum';
}

interface Gallery6Props {
  heading?: string;
  items?: GalleryItem[];
}

const Gallery6 = ({
  heading = "Gallery",
  items = [],
}: Gallery6Props) => {
  const { toast } = useToast();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [filter, setFilter] = useState<"all" | "Initiative" | "Referendum">("all");
  
  // Filter items based on selected filter
  const filteredItems = filter === "all" 
    ? items 
    : items.filter(item => item.type === filter);

  const handleShare = async (item: GalleryItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const title = item.title;
      const path = `/${item.type === "Initiative" ? "initiative" : "referendum"}/${item.slug}`;
      const url = `${window.location.origin}${path}`;

      if (navigator.share) {
        await navigator.share({ title: title, text: `Unterstütze: ${title}`, url });
        toast({ title: "Geteilt", description: "Freigabedialog geöffnet." });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link kopiert", description: url });
      }
    } catch (e: any) {
      toast({ title: "Teilen fehlgeschlagen", description: e?.message ?? "Unbekannter Fehler", variant: "destructive" });
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
  return (
    <section className="py-32 bg-muted/50">
      <div className="container">
        <div className="mb-8 flex flex-col justify-between md:mb-14 md:flex-row md:items-end lg:mb-16">
          <div>
            <h2 className="mb-3 text-3xl font-semibold md:mb-4 md:text-4xl lg:mb-6">
              {heading}
            </h2>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filter} onValueChange={(value: "all" | "Initiative" | "Referendum") => setFilter(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter auswählen" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-md z-50">
                  <SelectItem value="all">Alle anzeigen</SelectItem>
                  <SelectItem value="Initiative">Nur Initiativen</SelectItem>
                  <SelectItem value="Referendum">Nur Referenden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-8 flex shrink-0 items-center justify-start gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                carouselApi?.scrollPrev();
              }}
              disabled={!canScrollPrev}
              className="disabled:pointer-events-auto"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                carouselApi?.scrollNext();
              }}
              disabled={!canScrollNext}
              className="disabled:pointer-events-auto"
            >
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            breakpoints: {
              "(max-width: 768px)": {
                dragFree: true,
              },
            },
          }}
          className="relative left-[-1rem]"
        >
          <CarouselContent className="-mr-4 ml-8 2xl:ml-[max(8rem,calc(50vw-700px+1rem))] 2xl:mr-[max(0rem,calc(50vw-700px-1rem))]">
            {filteredItems.map((item) => {
              const currentDate = new Date().toLocaleDateString('de-CH', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              });
              
              return (
                <CarouselItem key={item.id} className="pl-4 md:max-w-[452px]">
                  <a
                    href={item.url}
                    className="group block"
                  >
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#8B1538] to-[#6B1029] p-6 text-white min-h-[320px] flex flex-col">
                      {/* Header with swiyu branding and icon */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="text-2xl font-light tracking-wide">swiyu</div>
                        <div className="bg-slate-800 p-3 rounded-lg">
                          {item.type === 'Initiative' ? (
                            <Vote className="h-8 w-8 text-white" />
                          ) : (
                            <FileText className="h-8 w-8 text-white" />
                          )}
                        </div>
                      </div>
                      
                      {/* Swiss Confederation badge */}
                      <div className="flex items-center gap-1 mb-4">
                        <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        </div>
                        <span className="text-xs text-white/80">A service of the Swiss Confederation</span>
                      </div>
                      
                      {/* Date */}
                      <div className="text-sm text-white/90 mb-4">{currentDate}</div>
                      
                      {/* Content */}
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-3 line-clamp-3 leading-tight">
                            {item.title}
                          </h3>
                          <p className="text-sm text-white/90 line-clamp-3 leading-relaxed">
                            {item.type}: {item.title.substring(0, 120)}...
                          </p>
                        </div>
                        
                        {/* Arrow button */}
                        <div className="flex justify-end mt-6">
                          <div className="bg-white/10 border border-white/20 rounded-lg p-2 transition-all duration-300 group-hover:bg-white/20 group-hover:border-white/30">
                            <ArrowRight className="h-5 w-5 text-white transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export { Gallery6 };