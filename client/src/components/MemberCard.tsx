import { useState } from "react";
import FemaleIcon from "../icons/FemaleIcon";
import MaleIcon from "../icons/MaleIcon";
import NonBinaryIcon from "../icons/NonBinaryIcon";
import TransgenderIcon from "../icons/TransgenderIcon";
import type { Member } from "../types/member";
import cn from "../utils/cn";

export default function MemberCard({
  member,
  index,
}: {
  member: Member;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const memberSinceYear = new Date(member.timestamp).getFullYear();

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  const genderIcons = {
    male: <MaleIcon />,
    female: <FemaleIcon />,
    "non-binary": <NonBinaryIcon />,
    transgender: <TransgenderIcon />,
    "prefer not to say": <></>,
  };

  return (
    <div
      onClick={toggleExpanded}
      className="flex cursor-pointer flex-col rounded-md border p-4 shadow-md"
    >
      <div className="mb-2 flex justify-between border-b pb-2">
        <h3>Chingu_{index + 1}</h3>
        {genderIcons[member.gender.toLowerCase() as keyof typeof genderIcons]}
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
