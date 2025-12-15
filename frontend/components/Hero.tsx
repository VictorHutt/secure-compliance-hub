"use client";

import { Shield, Lock, FileCheck, CheckCircle } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative pt-24 pb-20 px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-soft mb-6 animate-fade-up">
          <Lock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">FHE Encrypted</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
          Secure Compliance Hub
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "150ms" }}>
          Create and manage encrypted compliance records on-chain. 
          Your sensitive data stays private with fully homomorphic encryption.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <FeaturePill icon={Shield} text="End-to-End Encrypted" />
          <FeaturePill icon={FileCheck} text="On-Chain Verification" />
          <FeaturePill icon={CheckCircle} text="Tamper-Proof Records" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto animate-fade-up" style={{ animationDelay: "250ms" }}>
          <StatCard value="100%" label="Private" />
          <StatCard value="FHE" label="Encrypted" />
          <StatCard value="24/7" label="Available" />
        </div>
      </div>
    </section>
  );
};

const FeaturePill = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
    <Icon className="w-4 h-4 text-primary" />
    <span className="text-sm text-foreground">{text}</span>
  </div>
);

const StatCard = ({ value, label }: { value: string; label: string }) => (
  <div className="p-4 rounded-xl bg-card border border-border shadow-soft">
    <div className="text-xl font-bold text-primary">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);
