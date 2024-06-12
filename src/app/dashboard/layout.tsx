export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="h-screen flex flex-row">
    <div className="absolute h-screen w-64 translate-x-[-16rem] md:static md:h-auto md:w-64 md:translate-x-0 bg-amber-200 transition ease-in-out">
      Sidenav
    </div>
    <div className="flex-grow p-6 md:p-12">
      {children}
    </div>
  </div>
}