import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MemberCard from "../components/MemberCard";
import { useHasFilters } from "../stores/filterStore";
import { useMembers, useMembersActions } from "../stores/membersStore";

export default function ListPage() {
  const hasFilters = useHasFilters();
  const members = useMembers();
  const { fetchMembers } = useMembersActions();

  const navigate = useNavigate();

  useEffect(() => {
    if (!hasFilters) {
      navigate("/search");
    }
  }, [hasFilters]);

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div className="flex justify-center p-4">
      <ul className="flex w-full max-w-3xl flex-col gap-4">
        {members.map((member, index) => (
          <li key={index}>
            <MemberCard member={member} />
          </li>
        ))}
      </ul>
    </div>
  );
}
