import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">Terms of Service</h1>
            <p className="text-muted-foreground">Effective date: 2025-09-17</p>
          </div>

          <Card className="shadow-medium mb-6">
            <CardHeader>
              <CardTitle>Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2">
              <p>By accessing or using ShuttleGO, you agree to these Terms. If you do not agree, please do not use the service.</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Use of Service</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-2">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Service is for UG students and staff with valid ID.</li>
                  <li>Do not interfere with shuttle operations or app functionality.</li>
                  <li>Follow campus safety rules and driver instructions.</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Accounts & Security</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-2">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Keep your login credentials secure; you are responsible for activity on your account.</li>
                  <li>Report suspicious activity to ShuttleGO support immediately.</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Bookings & Payments</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-2">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Some features may require reservations; show valid QR codes when boarding.</li>
                  <li>Payments (if applicable) are processed by Paystack; we store only references.</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Limitations & Liability</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-2">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Service availability may vary; we may suspend features for maintenance.</li>
                  <li>ShuttleGO is not liable for indirect or incidental damages.</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-soft mt-6">
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              For support, contact <a className="text-primary underline" href="mailto:phillganiyu@gmail.com">phillganiyu@gmail.com</a> or call <a className="text-primary underline" href="tel:+233508844309">+233 50 884 4309</a>.
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;


