import React from "react";
import "./DonateMain.css";
import DonateNavigation from "../DonateNavigation";
import ChadMissionSupport from "../2-ChadMissionSupport/ChadMissionSupport";

const DonateMain = () => {
  return (
    <section className="DonateMain">
      <DonateNavigation currentPage="donate-main" />
      <ChadMissionSupport />
    </section>
  );
};

export default DonateMain;
