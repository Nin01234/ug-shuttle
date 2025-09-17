import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Bell, Users, BarChart3, Shield } from 'lucide-react';

const FeatureSection = () => {
  const features = [
    {
      icon: MapPin,
      title: 'Real-Time Tracking',
      description: 'Track all campus shuttles live on an interactive map with precise GPS locations.',
      color: 'text-ug-blue',
    },
    {
      icon: Clock,
      title: 'Live ETAs',
      description: 'Get accurate arrival times and never wait longer than necessary at shuttle stops.',
      color: 'text-ug-gold',
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Receive alerts for delays, route changes, and when your shuttle is approaching.',
      color: 'text-ug-success',
    },
    {
      icon: Users,
      title: 'Seat Booking',
      description: 'Reserve your seat during peak hours and skip the long queues.',
      color: 'text-ug-warning',
    },
    {
      icon: BarChart3,
      title: 'Usage Analytics',
      description: 'Administrators can optimize routes using AI-powered demand prediction.',
      color: 'text-ug-blue-light',
    },
    {
      icon: Shield,
      title: 'Safety Features',
      description: 'Emergency alerts and panic button for enhanced security on campus.',
      color: 'text-destructive',
    },
  ];

  return (
    <section className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need for
            <span className="text-primary"> Smart Transportation</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive shuttle management system designed specifically for the 
            University of Ghana campus community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index}
                className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-2 border-border/50 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-card flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300`}>
                    <IconComponent className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;