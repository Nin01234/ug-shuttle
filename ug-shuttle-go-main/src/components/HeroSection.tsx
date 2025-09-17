import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Users, ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Clock, Bus, Map, Bell, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import campusShuttle from '@/assets/campus-shuttle-1.jpg';
import ugCampus from '@/assets/ug-campus-aerial.jpg';
import shuttleInterior from '@/assets/shuttle-interior.jpg';
import studentsApp from '@/assets/students-using-app.jpg';

const HeroSection = () => {
  const slides = useMemo(() => [
    { image: campusShuttle, title: 'Track shuttles live', subtitle: 'Real-time GPS on UG campus' },
    { image: ugCampus, title: 'Plan your commute', subtitle: 'Routes optimized for students' },
    { image: shuttleInterior, title: 'Ride comfortably', subtitle: 'Modern fleet with ample seating' },
    { image: studentsApp, title: 'Book in seconds', subtitle: 'Instant QR code boarding' },
  ], []);

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isPaused) return;
    let start = performance.now();
    let raf: number;
    const duration = 4500;
    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (elapsed >= duration) {
        setCurrent((prev) => (prev + 1) % slides.length);
        start = performance.now();
        setProgress(0);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [slides.length, isPaused]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
      if (e.key === 'ArrowRight') setCurrent((prev) => (prev + 1) % slides.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [slides.length]);

  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(mql.matches);
    update();
    mql.addEventListener?.('change', update);
    return () => mql.removeEventListener?.('change', update);
  }, []);

  return (
    <section
      className="relative bg-gradient-hero text-white overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(e) => {
        setIsPaused(true);
        setTouchStartX(e.touches[0].clientX);
        setTouchDeltaX(0);
      }}
      onTouchMove={(e) => {
        if (touchStartX !== null) {
          setTouchDeltaX(e.touches[0].clientX - touchStartX);
        }
      }}
      onTouchEnd={() => {
        if (touchStartX !== null) {
          if (touchDeltaX > 50) {
            setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
          } else if (touchDeltaX < -50) {
            setCurrent((prev) => (prev + 1) % slides.length);
          }
        }
        setTouchStartX(null);
        setTouchDeltaX(0);
        setIsPaused(false);
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(600px_circle_at_20%_10%,rgba(255,215,0,0.25),transparent_60%),radial-gradient(700px_circle_at_80%_30%,rgba(14,23,55,0.6),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<?xml version=\'1.0\' encoding=\'UTF-8\'?><svg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'400\' viewBox=\'0 0 400 400\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/><feColorMatrix type=\'saturate\' values=\'0\'/><feComponentTransfer><feFuncA type=\'table\' tableValues=\'0 0.4\'/></feComponentTransfer></filter><rect width=\'100%\' height=\'100%\' filter=\'url(#n)\'/></svg>" )', backgroundSize: '400px 400px' }} />
      
      {/* Background Slider */
      }
      <div className="absolute inset-0">
        <div className="w-full h-full">
          <div
            className="w-full h-full transition-[background-image] duration-700 ease-in-out will-change-transform"
            style={{ backgroundImage: `url(${slides[current].image})`, backgroundSize: 'cover', backgroundPosition: 'center', transform: 'scale(1.05)', animation: reduceMotion ? undefined : 'kenburns 8s ease-in-out infinite' }}
          />
        </div>
      </div>

      {/* Subtle particles */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 animate-[spin_60s_linear_infinite] opacity-40">
          {[
            { left: '10%', top: '20%' },
            { left: '25%', top: '70%' },
            { left: '50%', top: '35%' },
            { left: '72%', top: '15%' },
            { left: '80%', top: '65%' },
            { left: '35%', top: '85%' },
          ].map((pos, i) => (
            <span key={i} className="absolute w-1.5 h-1.5 bg-white/30 rounded-full blur-[1px]" style={pos as React.CSSProperties} />
          ))}
        </div>
      </div>
      
      <div className="relative container mx-auto px-4 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left: Headline and CTAs */}
          <div className="max-w-xl">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 backdrop-blur px-3 py-1.5 text-xs md:text-sm text-white/90 mb-5">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-ug-gold" />
                Real-time campus mobility • New features rolling out
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Smart Shuttle for
                <span className="bg-gradient-to-r from-ug-gold to-ug-gold-light bg-clip-text text-transparent block mt-2">
                  University of Ghana
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                {slides[current].title} — {slides[current].subtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in">
              <Button asChild size="lg" className="bg-white text-ug-blue hover:bg-white/90 shadow-strong px-8 py-6 text-lg font-semibold">
                <Link to="/auth">
                  <Users className="w-5 h-5 mr-2" />
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-ug-blue px-8 py-6 text-lg font-semibold backdrop-blur-sm">
                <Link to="/tracking">
                  <Map className="w-5 h-5 mr-2" />
                  Live Tracking
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 mb-10">
              {[
                { label: 'Live GPS', icon: MapPin },
                { label: 'Smart Booking', icon: Clock },
                { label: 'Instant Alerts', icon: Bell },
                { label: 'Paystack Ready', icon: CreditCard },
              ].map((chip) => (
                <span key={chip.label} className="inline-flex items-center gap-2 text-xs md:text-sm px-3 py-1.5 rounded-full bg-white/10 text-white/90 border border-white/15 backdrop-blur-md">
                  <chip.icon className="w-3.5 h-3.5" />
                  {chip.label}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-6 max-w-md animate-scale-in">
              {[
                { value: '15+', label: 'Shuttles' },
                { value: '8', label: 'Routes' },
                { value: '10K+', label: 'Students' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-ug-gold mb-1">{item.value}</div>
                  <div className="text-white/80 text-sm">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Quick Book Panel */}
          <div className="lg:justify-self-end w-full max-w-md">
            <Card className="bg-white/95 text-foreground shadow-strong backdrop-blur supports-[backdrop-filter]:bg-white/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Bus className="w-5 h-5 text-ug-blue" /> Quick Book
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label id="route-label" className="block text-sm text-muted-foreground mb-2">Route</label>
                  <Select>
                    <SelectTrigger aria-labelledby="route-label" className="bg-white">
                      <SelectValue placeholder="Select a route" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Main Gate → Central</SelectItem>
                      <SelectItem value="legon">Legon Hall → Balme</SelectItem>
                      <SelectItem value="night">Night Shuttle Loop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="qb-date" className="block text-sm text-muted-foreground mb-2">Date</label>
                    <Input id="qb-date" type="date" className="bg-white" />
                  </div>
                  <div>
                    <label htmlFor="qb-time" className="block text-sm text-muted-foreground mb-2">Time</label>
                    <Input id="qb-time" type="time" className="bg-white" />
                  </div>
                </div>
                <div>
                  <label htmlFor="qb-pickup" className="block text-sm text-muted-foreground mb-2">Pickup Point</label>
                  <Input id="qb-pickup" placeholder="e.g., Legon Hall Stop" className="bg-white" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button asChild className="flex-1">
                    <Link to="/advanced-booking">Advanced Booking</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link to="/booking">Quick Reserve</Link>
                  </Button>
                </div>
                <p id="qb-help" className="text-xs text-muted-foreground pt-1">
                  You will receive a QR code for boarding after reservation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Progress & Controls */}
      <div className="absolute bottom-24 left-0 right-0 flex justify-center">
        <div className="w-64 h-1.5 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-white transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 md:px-4 pointer-events-none">
        <button
          aria-label="Previous slide"
          onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
          className="pointer-events-auto inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            aria-label={isPaused ? 'Play' : 'Pause'}
            onClick={() => setIsPaused((p) => !p)}
            className="inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
        </div>
        <button
          aria-label="Next slide"
          onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
          className="pointer-events-auto inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" fill="none" className="w-full h-12 md:h-20">
          <path
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,112C1200,107,1200,107,1200,107L1200,200L0,200Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;