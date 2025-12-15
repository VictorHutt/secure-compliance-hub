"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSecureCompliance } from "@/hooks/useSecureCompliance";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertCircle, CheckCircle2, Lock } from "lucide-react";

export const Header = () => {
  const { isDeployed, contractAddress, fhevmStatus } = useSecureCompliance();

  const getStatusBadge = () => {
    if (isDeployed === undefined) {
      return (
        <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-muted animate-pulse">
          <AlertCircle className="w-3 h-3 mr-1" />
          Checking...
        </Badge>
      );
    }
    
    if (!isDeployed) {
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
          <AlertCircle className="w-3 h-3 mr-1" />
          Not Deployed
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Contract Ready
      </Badge>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-effect border-b border-border/30 shadow-soft">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Logo with gradient background */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-soft">
            <Shield className="w-5 h-5 text-white" />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground">
                Secure Compliance
              </h1>
              {getStatusBadge()}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                FHE-Encrypted Records
              </p>
              {contractAddress && (
                <span className="text-[10px] text-muted-foreground/60 font-mono flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {fhevmStatus && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/50 shadow-soft">
              <div className={`w-2 h-2 rounded-full ${fhevmStatus === "ready" ? "bg-primary animate-pulse" : "bg-warning"}`} />
              <span className="text-xs text-muted-foreground">
                FHE {fhevmStatus === "ready" ? "Active" : fhevmStatus}
              </span>
            </div>
          )}
          <ConnectButton 
            chainStatus="icon"
            showBalance={false}
          />
        </div>
      </div>
    </header>
  );
};
