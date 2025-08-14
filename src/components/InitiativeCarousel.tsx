import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import initiatives from "@/data/initiatives.json";
import referendums from "@/data/referendums.json";

interface InitiativeCarouselProps {
  onSelect?: (type: "Initiative" | "Referendum", id: string) => void;
}

export const InitiativeCarousel = ({ onSelect }: InitiativeCarouselProps) => {
  const allItems = [
    ...initiatives.map(item => ({ ...item, type: "Initiative" as const })),
    ...referendums.map(item => ({ ...item, type: "Referendum" as const }))
  ];

  const handleItemClick = (item: typeof allItems[0]) => {
    if (onSelect) {
      onSelect(item.type, item.id);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Verfügbare Initiativen & Referenden
        </h2>
        <p className="text-muted-foreground">
          Wählen Sie eine Initiative oder ein Referendum zum Unterstützen
        </p>
      </div>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {allItems.map((item) => (
            <CarouselItem key={item.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <Card 
                className="h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50"
                onClick={() => handleItemClick(item)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge 
                      variant={item.type === "Initiative" ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      {item.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardTitle className="text-sm leading-tight line-clamp-3">
                    {item.title}
                  </CardTitle>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
};