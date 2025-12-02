import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router-dom";
import MemberCard from "../components/MemberCard";
import {
  useCountryName,
  useGender,
  useHasFilters,
  useRole,
  useSoloProjectTier,
  useVoyageTier,
  useYearJoined,
} from "../stores/filterStore";
import { useMembers, useMembersActions } from "../stores/membersStore";

export default function ListPage() {
  const hasFilters = useHasFilters();
  const members = useMembers();
  const { fetchMembers } = useMembersActions();
  const gender = useGender();
  const countryName = useCountryName();
  const yearJoined = useYearJoined();
  const role = useRole();
  const soloProjectTier = useSoloProjectTier();
  const voyageTier = useVoyageTier();

  const navigate = useNavigate();

  useEffect(() => {
    if (!hasFilters) {
      navigate("/search", { state: { redirectedFrom: "/list" } });
    }
  }, [hasFilters]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = members.filter((member) => {
    if (gender !== "" && member.gender.toLowerCase() !== gender.toLowerCase()) {
      return false;
    }
    if (
      countryName !== "" &&
      member.countryName.toLowerCase() !== countryName.toLowerCase()
    ) {
      return false;
    }
    if (role !== "" && member.role.toLowerCase() !== role.toLowerCase()) {
      return false;
    }
    if (
      soloProjectTier !== "" &&
      member.soloProjectTier.toLowerCase() !== soloProjectTier.toLowerCase()
    ) {
      return false;
    }
    if (
      voyageTier !== "" &&
      member.voyageTier.toLowerCase() !== voyageTier.toLowerCase()
    ) {
      return false;
    }
    if (
      yearJoined !== "" &&
      new Date(member.timestamp).getFullYear().toString() !== yearJoined
    ) {
      return false;
    }
    return true;
  });

  const [visibleCount, setVisibleCount] = useState(20);

  const loadMore = () => {
    setVisibleCount((prev) => prev + 20);
  };

  const visibleMembers = filteredMembers.slice(0, visibleCount);

  const hasMore = visibleMembers.length < filteredMembers.length;

  return (
    <div className="flex w-full justify-center p-8">
      <div
        id="membersScroll"
        className="scrollbar-hidden h-screen w-full max-w-3xl overflow-y-auto"
      >
        <InfiniteScroll
          dataLength={visibleMembers.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<p>Loading...</p>}
          scrollableTarget="memberScroll"
          className="flex flex-col gap-4"
        >
          {visibleMembers.map((member, index) => (
            <MemberCard key={index} member={member} />
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
}
