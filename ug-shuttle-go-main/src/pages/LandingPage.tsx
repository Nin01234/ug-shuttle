import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import Footer from '@/components/Footer';
import ImageCarousel from '@/components/ImageCarousel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Star, TrendingUp, Award, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import campusShuttle from '@/assets/campus-shuttle-1.jpg';
import ugCampus from '@/assets/ug-campus-aerial.jpg';
import shuttleInterior from '@/assets/shuttle-interior.jpg';
import studentsApp from '@/assets/students-using-app.jpg';

const LandingPage = () => {
  const campusImages = [
    {
      src: ugCampus,
      alt: 'University of Ghana Legon Campus Aerial View',
      title: 'Beautiful Campus Life',
      description: 'Experience the vibrant campus of University of Ghana'
    },
    {
      src: campusShuttle,
      alt: 'Campus Shuttle Service',
      title: 'Modern Shuttle Fleet',
      description: 'Comfortable and reliable transportation across campus'
    },
    {
      src: shuttleInterior,
      alt: 'Shuttle Interior',
      title: 'Comfortable Journey',
      description: 'Modern interiors designed for student comfort'
    },
    {
      src: studentsApp,
      alt: 'Students Using ShuttleGO App',
      title: 'Smart Technology',
      description: 'Students enjoying seamless shuttle booking experience'
    }
  ];

  const testimonials = [
    {
      name: 'Akosua Mensah',
      role: 'Computer Science Student',
      year: 'Level 300',
      content: 'ShuttleGO has completely transformed how I navigate campus. No more waiting in uncertainty!',
      rating: 5
    },
    {
      name: 'Kwame Osei',
      role: 'Business Administration',
      year: 'Level 200',
      content: 'The real-time tracking feature is amazing. I can plan my day perfectly around shuttle schedules.',
      rating: 5
    },
    {
      name: 'Ama Asante',
      role: 'Medical Student',
      year: 'Level 400',
      content: 'Booking shuttles has never been this easy. The app is intuitive and always reliable.',
      rating: 5
    }
  ];

  const stats = [
    { icon: Users, value: '25,000+', label: 'Active Students', color: 'text-ug-blue' },
    { icon: MapPin, value: '15+', label: 'Campus Routes', color: 'text-ug-success' },
    { icon: Clock, value: '24/7', label: 'Service Hours', color: 'text-ug-gold' },
    { icon: TrendingUp, value: '98%', label: 'Satisfaction Rate', color: 'text-primary' }
  ];
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        
        {/* Campus Showcase Section */}
        <section className="py-16 bg-gradient-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-ug-blue text-white">Campus Life</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Discover University of Ghana
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Experience the beauty and vibrancy of Ghana's premier university through our lens
              </p>
            </div>
            <ImageCarousel images={campusImages} className="max-w-4xl mx-auto" />
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center shadow-soft hover:shadow-medium transition-all">
                  <CardContent className="p-6">
                    <stat.icon className={`w-8 h-8 mx-auto mb-4 ${stat.color}`} />
                    <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <FeatureSection />

        {/* Student Testimonials */}
        <section className="py-16 bg-gradient-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-ug-gold text-ug-blue">Student Reviews</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                What Students Say
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Real experiences from University of Ghana students using ShuttleGO
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="shadow-soft hover:shadow-medium transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-ug-gold text-ug-gold" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role} • {testimonial.year}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose ShuttleGO */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-ug-success text-white">Why Choose Us</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  The SmartWay to Navigate Campus
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-ug-success mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Real-Time GPS Tracking</h3>
                      <p className="text-muted-foreground">
                        Know exactly where your shuttle is and when it'll arrive at your location.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-ug-success mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Smart Booking System</h3>
                      <p className="text-muted-foreground">
                        Reserve your seat in advance and get QR codes for seamless boarding.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-ug-success mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Instant Notifications</h3>
                      <p className="text-muted-foreground">
                        Get notified about delays, route changes, and arrival times.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-ug-success mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Campus Integration</h3>
                      <p className="text-muted-foreground">
                        Fully integrated with University of Ghana systems and schedules.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-ug-success mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">24/7 Support</h3>
                      <p className="text-muted-foreground">
                        Round-the-clock customer support for all your transportation needs.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-ug-success mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Eco-Friendly</h3>
                      <p className="text-muted-foreground">
                        Reduce carbon footprint with our efficient shared transportation system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-hero text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative container mx-auto px-4 text-center">
            <Award className="w-16 h-16 mx-auto mb-6 text-ug-gold" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Campus Experience?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of UG students who have already made the smart choice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg" 
                className="bg-white text-ug-blue hover:bg-white/90 shadow-strong px-8 py-6 text-lg font-semibold"
              >
                <Link to="/auth">Get Started Today</Link>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-ug-blue px-8 py-6 text-lg font-semibold backdrop-blur-sm"
              >
                <Link to="/tracking">Try Live Tracking</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;