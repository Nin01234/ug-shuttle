import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">Privacy Policy</h1>
            <p className="text-muted-foreground">Effective date: 2025-09-17</p>
          </div>

          <Card className="shadow-medium mb-6">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>ShuttleGO respects your privacy. This policy explains what we collect, why we collect it, and how we protect your information.</p>
              <p>For questions, contact us at <a className="text-primary underline" href="mailto:phillganiyu@gmail.com">phillganiyu@gmail.com</a> or call <a className="text-primary underline" href="tel:+233508844309">+233 50 884 4309</a>.</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Data We Collect</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-2">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Account info: name, UG email/ID, role (student/staff).</li>
                  <li>Usage data: app pages, features used, device metadata.</li>
                  <li>Location (optional): for live tracking and ETA accuracy.</li>
                  <li>Booking data: routes, timestamps, and QR validation.</li>
                  <li>Payments: reference IDs via Paystack (no card numbers stored).</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>How We Use Data</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-2">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Provide and improve shuttle tracking and booking services.</li>
                  <li>Show ETAs, optimize routes, and send service notifications.</li>
                  <li>Fraud prevention and platform security.</li>
                  <li>Analytics to enhance performance and reliability.</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Sharing & Third Parties</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-2">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Supabase for hosting, auth, and real-time data.</li>
                  <li>Paystack for payments (we store only references).</li>
                  <li>Map providers (Google or Mapbox) for maps/tiles.</li>
                  <li>We do not sell personal data.</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Your Choices</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-2">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Manage notifications in Settings.</li>
                  <li>Enable/disable location sharing on your device.</li>
                  <li>Request data access or deletion by contacting support.</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-soft mt-6">
            <CardHeader>
              <CardTitle>Security & Retention</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2">
              <p>We use encryption in transit and role-based access. Retention aligns with academic service requirements; data is removed or anonymized when no longer needed.</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPage;


