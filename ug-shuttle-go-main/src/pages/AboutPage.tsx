import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Award, MapPin, ShieldCheck, Clock, Cpu, Bus } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="py-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About ShuttleGO
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Revolutionizing campus transportation at the University of Ghana through 
              smart technology and student-centered design.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Target className="w-6 h-6 text-primary" />
                  <span>Our Mission</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To provide a seamless, efficient, and reliable shuttle tracking system 
                  that enhances the daily transportation experience for all members of the 
                  University of Ghana community.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Award className="w-6 h-6 text-ug-gold" />
                  <span>Our Vision</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To be the leading smart transportation platform for universities across 
                  Africa, setting new standards for campus mobility and student services.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* What We Offer */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">What We Offer</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>Real-time Tracking</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Live GPS positions, ETAs, and route progress for every active shuttle.</p>
                </CardContent>
              </Card>
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Cpu className="w-5 h-5 text-ug-gold" />
                    <span>Smart Scheduling</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Demand-aware routing, peak-time optimization, and predictive arrival estimates.</p>
                </CardContent>
              </Card>
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-ug-success" />
                    <span>Safety & Reliability</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Driver monitoring, service status alerts, and accessible transport options.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Milestones */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Milestones</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="shadow-soft"><CardContent className="p-6 text-center"><div className="text-4xl font-bold text-primary">90%+</div><div className="text-sm text-muted-foreground">ETA Accuracy</div></CardContent></Card>
              <Card className="shadow-soft"><CardContent className="p-6 text-center"><div className="text-4xl font-bold text-ug-gold">25%</div><div className="text-sm text-muted-foreground">Average Wait Reduced</div></CardContent></Card>
              <Card className="shadow-soft"><CardContent className="p-6 text-center"><div className="text-4xl font-bold text-ug-success">15k+</div><div className="text-sm text-muted-foreground">Monthly Active Users</div></CardContent></Card>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="shadow-soft"><CardContent className="p-6 text-center"><Bus className="w-8 h-8 mx-auto text-primary mb-2" /><div className="font-semibold">Track</div><div className="text-sm text-muted-foreground">View live shuttle locations and ETAs.</div></CardContent></Card>
              <Card className="shadow-soft"><CardContent className="p-6 text-center"><Users className="w-8 h-8 mx-auto text-ug-gold mb-2" /><div className="font-semibold">Plan</div><div className="text-sm text-muted-foreground">Choose the best route and time.</div></CardContent></Card>
              <Card className="shadow-soft"><CardContent className="p-6 text-center"><Target className="w-8 h-8 mx-auto text-ug-success mb-2" /><div className="font-semibold">Ride</div><div className="text-sm text-muted-foreground">Hop on and enjoy a smooth journey.</div></CardContent></Card>
            </div>
          </div>
          {/* Campus Info */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-8">University of Ghana, Legon</h2>
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-strong">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center mb-6">
                    <MapPin className="w-8 h-8 text-primary mr-3" />
                    <h3 className="text-2xl font-semibold text-foreground">Campus Location</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    The University of Ghana, Legon campus spans over 1,400 acres in the Greater Accra Region. 
                    With multiple faculties, residential halls, and facilities spread across the campus, 
                    efficient transportation is essential for our vibrant academic community of over 40,000 students and staff.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary mb-2">40,000+</div>
                      <div className="text-sm text-muted-foreground">Students & Staff</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-ug-gold mb-2">1,400</div>
                      <div className="text-sm text-muted-foreground">Acres Campus</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-ug-success mb-2">75+</div>
                      <div className="text-sm text-muted-foreground">Years of Excellence</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutPage;