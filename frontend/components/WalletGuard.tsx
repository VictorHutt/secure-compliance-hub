"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Wallet } from "lucide-react";

interface WalletGuardProps {
  children: React.ReactNode;
}

export const WalletGuard = ({ children }: WalletGuardProps) => {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full border-border/50 shadow-xl">
          <CardHeader className="text-center space-y-4 pb-8 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="flex justify-center">
              <div className="relative">
                <Shield className="w-16 h-16 text-primary" strokeWidth={1.5} />
                <Wallet className="absolute -bottom-1 -right-1 w-6 h-6 text-accent bg-background rounded-full p-1" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl">Wallet Required</CardTitle>
              <CardDescription className="mt-2">
                Connect your wallet to access encrypted compliance records
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4 pb-8">
            <ConnectButton />
            <p className="text-xs text-muted-foreground text-center">
              Your wallet is required to decrypt and view sensitive compliance data
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
