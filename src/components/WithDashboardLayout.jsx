import { Outlet } from "react-router-dom";
import CoachDashboard from "./CoachDashboard";

export default function WithDashboardLayout() {
  return (
    <div className="grid grid-cols-[260px_1fr] gap-4 items-start">
      <CoachDashboard />
      <section className="bg-gray-50 rounded-lg p-4">
        <Outlet />
      </section>
    </div>
  );
}