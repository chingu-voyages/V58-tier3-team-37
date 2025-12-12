import type React from "react";
import DataScientistIcon from "../icons/DataScientistIcon";
import DesignerIcon from "../icons/DesignerIcon";
import DeveloperIcon from "../icons/DeveloperIcon";
import POIcon from "../icons/POIcon";
import ScrumMasterIcon from "../icons/ScrumMasterIcon";

interface RoleIcon {
  [key: string]: React.ReactElement;
}

export const RoleIcon: RoleIcon = {
  "Data Scientist": <DataScientistIcon />,
  "Product Owner": <POIcon />,
  "Python Developer": <DeveloperIcon />,
  "Scrum Master": <ScrumMasterIcon />,
  "UI/UX Designer": <DesignerIcon />,
  "Web Developer": <DeveloperIcon />,
  "": <></>,
};
