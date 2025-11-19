import { Shield, Globe } from "lucide-react";

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <Globe className="w-10 h-10 text-primary" strokeWidth={1.5} />
      <Shield className="absolute w-6 h-6 text-accent" strokeWidth={2.5} />
    </div>
  );
};
