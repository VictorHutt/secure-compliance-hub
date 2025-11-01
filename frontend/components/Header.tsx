"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Logo } from "./Logo";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Encrypted Customs Compliance
            </h1>
            <p className="text-xs text-muted-foreground">
              Compliance Made Transparent—and Secure.
            </p>
          </div>
        </div>
        
        <ConnectButton 
          chainStatus="full"
          showBalance={false}
        />
      </div>
    </header>
  );
};
