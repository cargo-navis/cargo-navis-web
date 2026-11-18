export const DriverHeader: React.FC<{ driverName: string | undefined }> = ({ driverName }) => {
  return (
    // Fixed, full-width and solid: iOS Safari samples such a bar at the top edge for the installed app's status
    // bar area instead of blurring the content under it. Fixed rather than sticky, which iOS drops while scrolling.
    // No backdrop-filter here (Safari ignores such elements when sampling). 52px high: the page is padded by it and
    // the pinned next stop sticks right below it (see StopsTab).
    <header className="fixed inset-x-0 top-0 z-20 h-[52px] bg-muted">
      <div className="mx-auto flex h-full max-w-[480px] items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-2">
          <img alt="" className="size-7" src="/logomark.png" />
          <span className="font-medium">CargoNavis</span>
        </div>
        {driverName && <span className="truncate text-sm text-muted-foreground">{driverName}</span>}
      </div>
    </header>
  );
};
