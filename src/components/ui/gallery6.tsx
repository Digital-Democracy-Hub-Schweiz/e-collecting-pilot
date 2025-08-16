import { ArrowLeft, ArrowRight, Filter, Share2 } from "lucide-react";
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
            {filteredItems.map((item) => (
              <CarouselItem key={item.id} className="pl-4 md:max-w-[400px]">
                <div className="bg-card border border-border rounded-lg p-6 shadow-sm h-full flex flex-col justify-between min-h-[280px]">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-foreground leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                      {item.summary}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleShare(item, e)}
                      className="flex items-center gap-1 hover:bg-accent text-xs"
                    >
                      <Share2 className="h-3 w-3" />
                      Teilen
                    </Button>
                    <a
                      href={item.url}
                      className="inline-flex items-center justify-center rounded-md border border-destructive w-10 h-10 hover:bg-destructive/10 transition-colors group"
                    >
                      <ArrowRight className="h-4 w-4 text-destructive transition-transform group-hover:translate-x-0.5" />
                    </a>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export { Gallery6 };