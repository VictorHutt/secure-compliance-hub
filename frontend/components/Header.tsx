"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Logo } from "./Logo";
import { useSecureCompliance } from "@/hooks/useSecureCompliance";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertCircle, CheckCircle2 } from "lucide-react";

export const Header = () => {
  const { isDeployed, contractAddress, fhevmStatus } = useSecureCompliance();

  const getStatusBadge = () => {
    if (isDeployed === undefined) {
      return (
        <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-muted">
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
      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Contract Ready
      </Badge>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">
                Encrypted Customs Compliance
              </h1>
              {getStatusBadge()}
            </div>
            <p className="text-xs text-muted-foreground">
              Compliance Made Transparent—and Secure.
            </p>
            {contractAddress && (
              <p className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">
                <Shield className="w-2.5 h-2.5 inline mr-1" />
                {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {fhevmStatus && (
            <div className="hidden md:block text-xs text-muted-foreground">
              <span className="font-medium">FHE:</span>{" "}
              <span className={fhevmStatus === "ready" ? "text-success" : "text-warning"}>
                {fhevmStatus}
              </span>
            </div>
          )}
          <ConnectButton 
            chainStatus="full"
            showBalance={false}
          />
        </div>
      </div>
    </header>
  );
};
