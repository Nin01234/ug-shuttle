import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation, MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-ug-gold rounded-lg flex items-center justify-center">
                <Navigation className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">ShuttleGO</h3>
                <p className="text-primary-foreground/80 text-sm">University of Ghana</p>
              </div>
            </div>
            <p className="text-primary-foreground/80 mb-6 max-w-md">
              Smart shuttle tracking and management system for the University of Ghana, 
              Legon campus. Making transportation easier for our academic community.
            </p>
            <div className="flex space-x-4">
              <Button asChild variant="outline" size="sm" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <a href="https://www.facebook.com/universityofghana" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <a href="https://twitter.com/UnivofGhana" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X">
                  <Twitter className="w-4 h-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <a href="https://www.instagram.com/universityofghana" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Track Shuttle', 'About Us', 'FAQ', 'Contact', 'Student Portal', 'Admin Dashboard'].map((link) => (
                <li key={link}>
                  <Link 
                    to="/" 
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="w-4 h-4 text-ug-gold" />
                <span className="text-primary-foreground/80">University of Ghana, Legon Campus</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="w-4 h-4 text-ug-gold" />
                <span className="text-primary-foreground/80">+233 50 884 4309</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="w-4 h-4 text-ug-gold" />
                <span className="text-primary-foreground/80">phillganiyu@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-primary-foreground/20 my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-primary-foreground/80">
          <p>&copy; 2024 ShuttleGO - University of Ghana. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;