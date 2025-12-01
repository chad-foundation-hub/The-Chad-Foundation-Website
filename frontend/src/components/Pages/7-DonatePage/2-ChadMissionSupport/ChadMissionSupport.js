import React, { useState } from "react";
import "./ChadMissionSupport.css";
import DonateSection from "../1-DonateSection/DonateSection";

import MissionImageOne from "../../../../images/Donate-Images/missionSupport-image-one.png";
import MissionImageTwo from "../../../../images/Donate-Images/missionSupport-image-two.png";

const ChadMissionSupport = () => {
  const handleFirstButtonClick = () => {
    window.open(
      "https://www.amazon.com/CHAD-Celebration-Beyond-Mothers-Memories/dp/1982250801/ref=sr_1_1?crid=3MQQ15ID0BNCP&amp&dib=eyJ2IjoiMSJ9.3NuGObxJ0-qKBnkb99QYHQ.R2pf5_Mp7zRRTEPsP7NGf26Pu9DdwzwklmrozAIVDmk&amp&dib_tag=se&amp&keywords=CHAD%2C+A+Celebration+of+Life+-+Beyond+A+Mother%27s+Memories+by+Arista&amp&qid=1713070639&amp&s=books&amp&sprefix=chad%2C+a+celebration+of+life+-+beyond+a+mother%27s+memories+by+arista%2Cstripbooks%2C111&amp&sr=1-1",
      "_blank"
    );
  };

  const handleSecondButtonClick = () => {
    window.open("https://www.google.com", "_blank");
  };

  const [isBookExpanded, setIsBookExpanded] = useState(false);
  const [isKeychainExpanded, setIsKeychainExpanded] = useState(false);

  const bookInitialText =
    " Celebrating the lives of young athletes lost to Sudden Cardiac Death and the journey of its survivors, this uplifting memoir details the 25-year history of The Chad Foundation for Athletes and Artists to safeguard hearts by providing 10,000 Echocardiogram and EKG screenings in 5 states, and Austria, and Sweden.";

  const bookExpandedText =
    ' It shares heartfelt stories of other Families who have lost children to SCD and presents the history and importance of heart screenings - its pros and cons - through scientific studies, as well as the lifesaving tools - AEDs and CPR. The book has the endorsement of Adam Silver, Commissioner of the National Basketball Association. From Sudden Cardiac Victims to Survivors - heartbreak to heroism - learn how The Chad Foundation and countless advocate organizations, cardiologists, and health professionals worldwide have safeguarded the lives of youth through early preventive screening so they will have a better future. 100% of the royalties from the CHAD Book go directly to The Chad Foundation for Athletes and Artists, a nonprofit, charitable organization, with a 501 c 3 tax-exempt status to benefit the youth it serves. "The Gift of Heart and Art"';

  const keychainInitialText =
    "Chad was a great guy who loved all people, cared about their dreams. He never drank, smoked or did drugs. He always was the 'designated driver' when he and his friends went out to the clubs dancing, and you always had to wear a seatbelt in Chad's car. Please safeguard your life and others by joining the 'Chad Safe Driver Campaign - Life is A Gift.'";

  const keychainExpandedText =
    ' Order your "Life is A Gift" Keychain Shield Pendant," a heavyweight, curved shield pendant with a pewter-like finish. Join the "Chad Honour Roll of Safe Drivers" by taking the "Life is a Gift pledge: Save Lives, I will not text/drink and drive." Join the "Honor Roll of Safe Drivers" from all 50 states, and countries world-wide. Hang it in your car, your keychain, use as a piece of jewelry or give a gift as a reminder, "Life is a Gift!" The Keychain Pendant comes in a navy velveteen embossed drawstring pouch; high-quality embossed navy gift box is $5 additional.';

  return (
    <section className="ChadMissionSupport">
      <div className="main-container">
        <h2 className="donate-header">Donate to Save Young Lives</h2>
        <DonateSection />
        <div className="otherWays-main">
          <h2 className="otherWays-header">Other ways to support</h2>
          {/* Book */}
          <div className="otherWays-box">
            <div className="otherWays-box-left-side">
              <img
                src={MissionImageOne}
                alt="book"
                className="otherWays-image"
              />
            </div>

            <div className="otherWays-box-right-side">
              <h3 className="otherWays-h3">
                CHAD: A Celebration of Life Beyond a Mother’s Memories
              </h3>

              <p className="otherWays-p">
                {bookInitialText}
                {isBookExpanded && bookExpandedText}
                <span
                  className="otherWays-readMore"
                  onClick={() => setIsBookExpanded((prev) => !prev)}
                >
                  {isBookExpanded ? " ..read less" : " ..read more"}
                </span>
              </p>

              <button
                className="otherWays-btn"
                onClick={handleFirstButtonClick}
              >
                Donate with Purchase
              </button>
            </div>
          </div>

          {/* KeyChain */}
          <div className="otherWays-box">
            <div className="otherWays-box-left-side">
              <img
                src={MissionImageTwo}
                alt="keychain"
                className="otherWays-image"
              />
            </div>

            <div className="otherWays-box-right-side">
              <h3 className="otherWays-h3">
                “Life is a Gift” Keychain Pendant - Chad Safe Driver Campaign
              </h3>

              <p className="otherWays-p">
                {keychainInitialText}
                {isKeychainExpanded && keychainExpandedText}
                <span
                  className="otherWays-readMore"
                  onClick={() => setIsKeychainExpanded((prev) => !prev)}
                >
                  {isKeychainExpanded ? " Read less" : " ..read more"}
                </span>
              </p>

              <button
                className="otherWays-btn"
                onClick={handleSecondButtonClick}
              >
                Donate with Purchase
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChadMissionSupport;
