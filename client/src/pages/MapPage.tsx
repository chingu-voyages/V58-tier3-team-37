import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHasFilters } from "../stores/filterStore";

export default function MapPage() {
  const hasFilters = useHasFilters();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasFilters) {
      navigate("/search", { state: { redirectedFrom: "/map" } });
    }
  }, [hasFilters]);

  return <div className="p-4">Map Page</div>;
}
