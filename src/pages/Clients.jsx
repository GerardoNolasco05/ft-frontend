// src/pages/Clients.jsx
import { useParams } from "react-router-dom";
import ClientHub from "../components/ClientHub.jsx";

function Clients() {
  const { id } = useParams();               // "1", "2", etc. (or undefined)
  const routeClientId = id ? Number(id) : null;

  return (
    <div className="fixed bg-[#0f141f] text-white overflow-auto pt-55 ml-30">
      <ClientHub routeClientId={routeClientId} />   {/* ⬅ pass it down */}
    </div>
  );
}

export default Clients;
