import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router-dom";
import FilterBar from "../components/FilterBar";
import MemberCard from "../components/MemberCard";
import {
  useCountryCode,
  useGender,
  useHasFilters,
  useRole,
  useSoloProjectTier,
  useVoyageTier,
  useYearJoined,
} from "../stores/filterStore";
import { useMembers, useMembersActions } from "../stores/membersStore";
import buildFilters from "../utils/buildFilters";

export default function ListPage() {
  const hasFilters = useHasFilters();
  const members = useMembers();
  const { fetchMembers, resetMembers, resetOffset } = useMembersActions();
  const gender = useGender();
  const countryCode = useCountryCode();
  const yearJoined = useYearJoined();
  const role = useRole();
  const soloProjectTier = useSoloProjectTier();
  const voyageTier = useVoyageTier();

  const navigate = useNavigate();

  useEffect(() => {
    console.log(hasFilters);
    if (!hasFilters) {
      navigate("/search", { state: { redirectedFrom: "/list" } });
    }
  }, [hasFilters]);

  const filteredMembers = members.filter((member) => {
    if (gender !== "" && member.gender.toLowerCase() !== gender.toLowerCase()) {
      return false;
    }
    if (
      countryCode !== "" &&
      member.countryCode.toLowerCase() !== countryCode.toLowerCase()
    ) {
      return false;
    }
    if (
      role.trim() !== "" &&
      !role.toLowerCase().includes(member.role.toLowerCase())
    ) {
      return false;
    }
    if (
      soloProjectTier !== null &&
      member.soloProjectTier !== soloProjectTier
    ) {
      return false;
    }
    if (voyageTier !== "" && !member.voyageTiers.includes(voyageTier)) {
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

  const filters = buildFilters(gender, countryCode, role, soloProjectTier);

  useEffect(() => {
    resetMembers();
    resetOffset();
    setVisibleCount(20);
    fetchMembers(filters);
  }, [gender, countryCode, role, soloProjectTier]);

  const [visibleCount, setVisibleCount] = useState(20);

  const loadMore = () => {
    const nextCount = visibleCount + 20;
    setVisibleCount(nextCount);

    if (nextCount > members.length) {
      fetchMembers(filters);
    }
  };

  const visibleMembers = filteredMembers.slice(0, visibleCount);

  const hasMore = visibleMembers.length < filteredMembers.length;

  return (
    <div className="flex flex-col">
      <FilterBar />
      <div className="flex w-full justify-center p-8">
        <div
          id="membersScroll"
          className="scrollbar-hidden h-screen w-full max-w-3xl overflow-y-auto"
        >
          {visibleMembers.length === 0 ? (
            <div>
              <p>No members found matching the selected filters.</p>
              <button
                className="btn bg-primary-brand border-primary-brand mt-4 border"
                onClick={() => navigate("/search")}
              >
                Search Again
              </button>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={visibleMembers.length}
              next={loadMore}
              hasMore={hasMore}
              loader={<p>Loading...</p>}
              scrollableTarget="memberScroll"
              className="flex flex-col gap-4"
            >
              {visibleMembers.map((member) => (
                <MemberCard
                  key={member.id + nanoid()}
                  member={member}
                  index={member.id}
                />
              ))}
            </InfiniteScroll>
          )}
        </div>
      </div>
    </div>
  );
}
