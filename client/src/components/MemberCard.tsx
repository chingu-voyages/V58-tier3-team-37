import { useState } from "react";
import type { Member } from "../types/member";
import cn from "../utils/cn";

export default function MemberCard({ member }: { member: Member }) {
  const [expanded, setExpanded] = useState(false);

  const memberSinceYear = new Date(member.timestamp).getFullYear();

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <div
      onClick={toggleExpanded}
      className="flex cursor-pointer flex-col rounded-md border p-4 shadow-md"
    >
      <div className="mb-2 flex justify-between border-b pb-2">
        <h3>{member.email}</h3>
      </div>
      <div className="flex flex-col gap-2">
        <p>
          Role: {member.roleType} {member.role}
        </p>
        <p>Member Since: {memberSinceYear}</p>
        <p>Country: {member.countryName}</p>
      </div>
      <div
        className={cn(
          expanded ? "flex" : "hidden",
          "mt-2 flex-col gap-2 border-t pt-2",
        )}
      >
        <p>Solo Project Tier: {member.soloProjectTier}</p>
        <p>Voyage Tier: {member.voyageTier}</p>
        <p>Goal: {member.goal}</p>
      </div>
    </div>
  );
}
