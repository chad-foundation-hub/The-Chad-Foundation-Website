import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./LatestHeartNews.css";

const newsArticles = [
  {
    title: "Florida Is the First State to Require Student Athletes Get Life-Saving EKGs",
    source: "Central Florida Public Media",
    date: "June 29, 2025",
    excerpt:
      "Florida became the first U.S. state to mandate EKG screenings for student athletes — a landmark step toward preventing sudden cardiac death in young people.",
    url: "https://www.cfpublic.org/education/2025-06-29/florida-is-the-first-state-to-require-student-athletes-get-life-saving-ekgs",
  },
  {
    title: "Teaching Teens and Their Parents About the Impact of Good Sleep Hygiene on Heart Health",
    source: "Columbia Doctors",
    date: "July 25, 2025",
    excerpt:
      "Columbia University researchers examine how healthy sleep habits in adolescents directly shape cardiovascular health, and share practical guidance for parents and teens.",
    url: "https://www.columbiadoctors.org/news/teaching-teens-and-their-parents-impact-good-sleep-hygiene-heart-health",
  },
];

const LatestHeartNews = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 7000,
    pauseOnHover: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 1,
          arrows: false,
        },
      },
    ],
  };

  return (
    <section className="LatestHeartNews" id="latest-heart-news">
      <div className="main-container">
        <h2 className="latestHeartNews-header">Latest Heart News</h2>
        <Slider {...settings} className="latestHeartNews-slider">
          {newsArticles.map((article, i) => (
            <div key={i} className="latestHeartNews-slide">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="latestHeartNews-card"
              >
                <div className="latestHeartNews-meta">
                  <span className="latestHeartNews-source">{article.source}</span>
                  {article.date && (
                    <span className="latestHeartNews-date">{article.date}</span>
                  )}
                </div>
                <h3 className="latestHeartNews-title">{article.title}</h3>
                <p className="latestHeartNews-excerpt">{article.excerpt}</p>
                <span className="latestHeartNews-readMore">Read Article →</span>
              </a>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default LatestHeartNews;
