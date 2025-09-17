import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

interface ImageCarouselProps {
  images: Array<{
    src: string;
    alt: string;
    title?: string;
    description?: string;
  }>;
  className?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  className = '', 
  autoplay = true,
  autoplayDelay = 4000 
}) => {
  const plugin = autoplay ? [
    Autoplay({
      delay: autoplayDelay,
    })
  ] : [];

  return (
    <Carousel
      plugins={plugin}
      className={`w-full ${className}`}
      opts={{
        align: "start",
        loop: true,
      }}
    >
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-64 md:h-80 lg:h-96 object-cover transition-transform duration-700 hover:scale-105"
              />
              {(image.title || image.description) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                  <div className="p-6 text-white">
                    {image.title && (
                      <h3 className="text-xl md:text-2xl font-bold mb-2">{image.title}</h3>
                    )}
                    {image.description && (
                      <p className="text-white/90">{image.description}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
};

export default ImageCarousel;