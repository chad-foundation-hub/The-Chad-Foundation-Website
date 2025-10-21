import React, { useState } from "react";
import "./Testimonials.css";
import AboutUsNavigation from "../AboutUsNavigation";
import PhotoOne from "../../../../images/AboutUs-Images/testimonials-photo-1.png";
import PhotoTwo from "../../../../images/AboutUs-Images/testimonials-photo-2.png";
import PhotoThree from "../../../../images/AboutUs-Images/testimonials-photo-3.png";
import PhotoFour from "../../../../images/AboutUs-Images/testimonials-photo-4.png";
import PhotoFive from "../../../../images/AboutUs-Images/testimonials-photo-5.png";
import PhotoSix from "../../../../images/AboutUs-Images/testimonials-photo-6.png";
import PhotoSeven from "../../../../images/AboutUs-Images/testimonials-photo-7.jpg";
import PhotoEight from "../../../../images/AboutUs-Images/testimonials-photo-8.jpg";
import PhotoNine from "../../../../images/AboutUs-Images/testimonials-photo-9.png";

const TestimonialsCard = ({
  name,
  position,
  place,
  initialStoryText,
  expandedStoryText,
  imageUrl,
  isExpandable,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="testimonials-card">
      <img
        src={imageUrl}
        alt={`${name} testimonial`}
        className="testimonials-image"
      />
      <div className="testimonials-content">
        <div className="testimonials-content-name-and-position">
          <h4 className="testimonials-name">{name}</h4>
          {position && <p className="testimonials-position">{position}</p>}
        </div>
        {place && <p className="testimonials-place">{place}</p>}
        <div className="testimonials-text-and-spans">
          <p className="testimonials-text">
            {initialStoryText}
            {isExpandable && !isExpanded && (
              <span className="readMore-span" onClick={toggleExpansion}>
                {" ... read more"}
              </span>
            )}
            {isExpandable && isExpanded && (
              <>
                {expandedStoryText}
                <span className="readMore-span" onClick={toggleExpansion}>
                  {" .. read less"}
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  return (
    <section className="Testimonials-Two">
      <AboutUsNavigation currentPage="testimonials" />
      <div className="main-container">
        <h2 className="testimonials-header">What Our Supporters Have to Say</h2>
        <div className="testimonials-container">
          {/* ONE */}
          <TestimonialsCard
            name="Troy Wirth,"
            position="Owner"
            place="Orange Coast Insurance Solutions, Irvine, CA"
            initialStoryText="I have been meaning to write and thank you for all the spectacular work The Chad Foundation has been doing across the country. I am especially appreciative because I am one of the lives you might have saved. Due to your echocardiogram screening at the Chad Foundation Malibu Benefit for Children’s Hospital, Doctors detected an arrhythmia and advised"
            expandedStoryText=" immediate follow-up which I did and ended up having surgery a month later in October, with a diagnosis of Wolff-Parkinson-White Syndrome. All my life, I suffered from this undiagnosed physical challenge and played Class 1 volleyball at USC and never could play to my optimum. Now, I am playing sports better than ever, thanks to your fortuitous screening event. I would be honored to be a spokesperson for your cause, of which I am living proof!"
            imageUrl={PhotoOne}
            isExpandable={true}
          />
          {/* TWO */}
          <TestimonialsCard
            name="Alan B. Lewis, MD, "
            position="Professor of Pediatrics"
            place="Children’s Hospital Los Angeles Heart Institute"
            initialStoryText="The Division of Cardiology at Children’s Hospital Los Angeles has collaborated with The Chad Foundation for the past 17 years to perform echocardiographic screening of young athletes. We in the Heart Institute are enthusiastic in our support of the endeavors of The Chad Foundation."
            expandedStoryText=""
            imageUrl={PhotoTwo}
            isExpandable={false}
          />
          {/* THREE */}
          <TestimonialsCard
            name="Jim Gosset,"
            position="Head Athletic Trainer"
            place="Columbia University in the City of New York"
            initialStoryText="Collective data from their screening resources may yield a further understanding of heart-related illnesses in the young and causes of sudden death. For these reasons I give my unreserved support."
            expandedStoryText=""
            imageUrl={PhotoThree}
            isExpandable={false}
          />
          {/* FOUR */}
          <TestimonialsCard
            name="Bernhard Wolf,"
            position="Managing Director"
            place="Homeless Streetsoccer World Cup, Graz, Austria"
            initialStoryText="On behalf of the INSP, International Streetnewspapers, and the 26 teams of homeless athletes who participated in the 1st and 2nd Homeless Streetsoccer World Cup, we thank you and The Chad Foundation for Athletes and Artists for providing this lifesaving test for our impoverished athletes of the world."
            expandedStoryText=""
            imageUrl={PhotoFour}
            isExpandable={false}
          />
          {/* FIVE */}
          <TestimonialsCard
            name="Michael Willers, MD"
            place="The Children’s Heart Center of Western Massachusetts"
            initialStoryText="Cardiac Screenings provide an invaluable service to young people, their families, and their communities. They detect potentially fatal heart problems that were previously invisible. They save lives. They keep families intact. They make it possible for the dreams of young people to become reality."
            expandedStoryText=""
            imageUrl={PhotoFive}
            isExpandable={false}
          />
          {/* SIX */}
          <TestimonialsCard
            name="Nancy Cena,"
            position="Athletic Director"
            place="Port Richmond High School, Staten Island, New York"
            initialStoryText="Dear Arista, On behalf of the Port Richmond High School Athletic Program and Principal Timothy Gannon, I would like to thank you for providing complimentary heart screenings for our Varisty and Junior Varsity Football Teams."
            expandedStoryText=""
            imageUrl={PhotoSix}
            isExpandable={false}
          />
          {/* SEVEN */}
          <TestimonialsCard
            name="Jared LaCorte,"
            position="MD, FAAP, FACC"
            place="Staten Island Pediatric Cardiology"
            initialStoryText="As a physician, especially one who specializes in pediatric cardiology and also as a father, it has been my privilege to participate in cardiac screening events such as those sponsored by the Chad Foundation "
            expandedStoryText=" I feel very strongly that every young athlete should receive cardiac clearance prior to participating in competitive sports. Testing is non-invasive, results can be obtained quickly and taking these types of preventative measures can potentially save lives."
            imageUrl={PhotoSeven}
            isExpandable={true}
          />
          {/* EIGHT */}
          <TestimonialsCard
            name="Michael R. Bloomberg,"
            position="Mayor"
            initialStoryText="Dear Friends, It is a pleasure to welcome everyone to the Harlem YMCA, where the Chad Foundation for Artists and Athletes is offering preventative screenings for young athletes throughout the day "
            expandedStoryText=" On behalf of the City of New York, I thank all those whose generosity and dedication has made these screenings possible. I wish all of the athletes participating in these screenings the very best for an informative day, and for a healthy, happy future. Sincerely, Michael R. Bloomberg, Mayor"
            imageUrl={PhotoEight}
            isExpandable={true}
          />
          {/* NINE */}
          <TestimonialsCard
            name="Raecene Shoaff, Lindsay’s mom,"
            position="(Lindsay Shoaff, Survivor)"
            initialStoryText="You can imagine my surprise when the Dr. pulled me aside at the Chad Heart Screening to tell me that they had detected something wrong with my daughter Lindsay’s heart (she was twelve years old and a Water Polo player). We acted immediately on the findings and went to see our pediatrician.  Once he found out she was a Water Polo player and did a "
            expandedStoryText="  basic examination he tried to assure us that she was very healthy especially considering the sport she played. I got a little demanding with the pediatrician. Her doctor referred us to a pediatric cardiologist who conducted the Echo and EKG again and confirmed Dr. L.’s findings at the CHAD Fundraiser Benefit. My daughter has Aortic Regurgitation with Stenosis, which will require a heart valve transplant at some point in her life. The doctor explained that my daughter will have to be very aware of her condition for the rest of her life. The good news is that she doesn’t have to give up Water Polo. He said that the chances of this ever being caught by a general practitioner or pediatrician was probably zero. In the words of our pediatrician, I do consider us the luckiest people for meeting you and being part of The Chad Foundation. Thank you."
            imageUrl={PhotoNine}
            isExpandable={true}
          />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
