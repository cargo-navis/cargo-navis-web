import { Sidebar } from './(sidenav)/Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="h-screen flex flex-row">
    <div className="flex flex-col absolute h-screen w-64  py-6 px-4 md:static md:h-auto md:w-64 md:translate-x-0 bg-sidebar-gradient bg-[#923CB5] transition ease-in-out">
      <Sidebar />
    </div>
    <div className="flex-grow p-6 md:p-12">
      {children}
    </div>
  </div>
}