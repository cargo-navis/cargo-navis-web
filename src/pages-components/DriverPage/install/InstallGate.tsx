import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import type { InstallPlatform } from './installHint';
import { InstallInstructions } from './InstallInstructions';

interface InstallGateProps {
  platform: InstallPlatform;
  onInstall(): void;
  onContinueInBrowser(): void;
}

/** Full-screen install screen shown in a phone browser instead of the stops, once the driver is signed in. */
export const InstallGate: React.FC<InstallGateProps> = ({ platform, onInstall, onContinueInBrowser }) => (
  <div className="flex grow flex-col justify-center gap-8 px-6 py-16">
    <div className="flex flex-col items-center gap-3 text-center">
      <img alt="" className="size-16 rounded-xl" src="/apple-touch-icon.png" />
      <h1 className="font-heading text-2xl font-bold tracking-tight">Instaliraj Cargo Navis</h1>
      <p className="text-muted-foreground">Nalozi i ruta prijevoza rade kao aplikacija na tvom mobitelu.</p>
    </div>
    <Card className="gap-4 p-6">
      <InstallInstructions layout="steps" platform={platform} onInstall={onInstall} />
    </Card>
    <div className="flex flex-col items-center gap-4 text-center">
      {platform !== 'installed' && (
        <span className="text-sm text-muted-foreground">Već instalirano? Otvori Cargo Navis s početnog zaslona.</span>
      )}
      <div className="flex w-full items-center gap-3">
        <div className="h-px grow bg-border" />
        <span className="text-xs font-medium text-muted-foreground">ili</span>
        <div className="h-px grow bg-border" />
      </div>
      <Button className="w-full" size="xl" variant="ghost" onClick={onContinueInBrowser}>
        Nastavi u pregledniku
      </Button>
    </div>
  </div>
);
