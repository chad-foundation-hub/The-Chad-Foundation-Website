import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import HomeScreen from "../1-HomeScreen/HomeScreen";
import StoryMission from "../2-StoryMission/StoryMission";
import WhatYouShouldKnow from "../3-WhatYouShouldKnow/WhatYouShouldKnow";
import HowWeHelp from "../4-HowWeHelp/HowWeHelp";
import SurvivorsStories from "../5-SurvivorsStories/SurvivorsStories";
import ListenExperts from "../6-ListenExperts/ListenExperts";
import Support from "../7-Support/Support";
import LatestHeartNews from "../8-LatestHeartNews/LatestHeartNews";

function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#latest-heart-news") {
      const timer = setTimeout(() => {
        const el = document.getElementById("latest-heart-news");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  return (
    <div>
      <HomeScreen />
      <StoryMission />
      <WhatYouShouldKnow />
      <HowWeHelp />
      <SurvivorsStories />
      <ListenExperts />
      <Support />
      <LatestHeartNews />
    </div>
  );
}

export default HomePage;
