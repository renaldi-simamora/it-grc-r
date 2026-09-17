import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { BackgroundWaves } from '@/components/landing/BackgroundWaves';
import { Hero } from '@/components/landing/Hero';
import { GRCWorkflow } from '@/components/landing/GRCWorkflow';
import { Features } from '@/components/landing/Features';
import { RiskMatrixSection } from '@/components/landing/RiskMatrixSection';
import { ComplianceSection } from '@/components/landing/ComplianceSection';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'GRCTrack — IT Governance, Risk & Compliance Management',
  description: 'Portfolio-based IT GRC platform for managing assets, risks, controls, evidence, findings, remediation, and compliance assessments.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#04070B] text-slate-100 relative overflow-x-clip selection:bg-[#4ADE80] selection:text-black">
      {/* Sticky Glass Navbar */}
      <Navbar />

      {/* Main Content Layout */}
      <main className="relative">
        {/* Enterprise Cyber-Defense Background Grid */}
        <BackgroundWaves />

        {/* Section 1: Hero & Executive Preview */}
        <Hero />

        {/* Section 2: GRC Lifecycle 9-Step Workflow */}
        <GRCWorkflow />

        {/* Section 3: 8 Core GRC Modules */}
        <Features />

        {/* Section 4: 5x5 Inherent Risk Matrix Engine */}
        <RiskMatrixSection />

        {/* Section 5: Compliance Adherence & Domains */}
        <ComplianceSection />
      </main>

      {/* Section 6: Footer with Mandatory Disclaimer */}
      <Footer />
    </div>
  );
}
