import { useEffect } from "react";
import { useMembers, useMembersActions } from "../stores/membersStore";

export default function ListPage() {
  const members = useMembers();
  const { fetchMembers } = useMembersActions();

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div>
      <ul>
        {members.map((member, index) => (
          <li key={index}>
            <p>{member.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
