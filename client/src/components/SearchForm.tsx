export default function SearchForm() {
  return (
    <div>
      <div className="flex justify-center">
        <h2>Who are you looking for?</h2>
        <p className="absolute right-2">X</p>
      </div>
      <form action="">
        <div>
          <fieldset className="gender-fieldset">
            <legend className="gender-legend">Gender</legend>
            <select defaultValue="" className="select">
              <option disabled={true}></option>
              <option>Male</option>
              <option>Female</option>
              <option>Non-Binary</option>
              <option>Transgender</option>
              <option>Prefer not to say</option>
            </select>
          </fieldset>
          <fieldset className="country-fieldset">
            <legend className="country-legend">Country</legend>
            <select defaultValue="" className="select">
              <option disabled={true}></option>
            </select>
          </fieldset>
          <fieldset className="yearJoined-fieldset">
            <legend className="yearJoined-legend">Year Joined</legend>
            <select defaultValue="" className="select">
              <option disabled={true}></option>
            </select>
          </fieldset>
          <fieldset className="role-fieldset">
            <legend className="role-legend">Role</legend>
            <select defaultValue="" className="select">
              <option disabled={true}></option>
              <option>Data Scientist</option>
              <option>Product Owner</option>
              <option>Python Developer</option>
              <option>Scrum Master</option>
              <option>Web Developer</option>
              <option>UI/UX Designer</option>
            </select>
          </fieldset>
          <fieldset className="soloProjectTier-fieldset">
            <legend className="soloProjectTier-legend">
              Solo Project Tier
            </legend>
            <select defaultValue="" className="select">
              <option disabled={true}></option>
              <option>Tier 1</option>
              <option>Tier 2</option>
              <option>Tier 3</option>
            </select>
          </fieldset>
          <fieldset className="voyageTier-fieldset">
            <legend className="voyageTier-legend">Voyage Tier</legend>
            <select defaultValue="" className="select">
              <option disabled={true}></option>
              <option>Tier 1</option>
              <option>Tier 2</option>
              <option>Tier 3</option>
            </select>
          </fieldset>
          <fieldset className="voyage-fieldset">
            <legend className="voyage-legend">Voyage</legend>
            <select defaultValue="" className="select">
              <option disabled={true}></option>
              <option>Voyage 1</option>
              <option>Voyage 2</option>
              <option>Voyage 3</option>
            </select>
          </fieldset>
        </div>
        <div className-="flex justify-between gap-4 mt-4">
          <button className="bg-secondary rounded-md px-4 py-2">
            Clear Filters
          </button>
          <button className="bg-primary rounded-md px-4 py-2">Submit</button>
        </div>
      </form>
    </div>
  );
}
