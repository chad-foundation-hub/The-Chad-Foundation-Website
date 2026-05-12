import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "./Footer.css";
import FeedbackForm from "./FeedbackForm";

import FacebookIcon from "../../images/Footer-Images/facebook.png";
import VideoIcon from "../../images/Footer-Images/video.png";
import LinkedinIcon from "../../images/Footer-Images/linkedin.png";
import InstagramIcon from "../../images/Footer-Images/instagram.png";

function Footer() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <div className="footer-grid-container">
      <Container>
        <Row>
          {/* Main */}
          <Col md className="footer-col footer-main-col">
            <h2 className="footer-h2">
              The Chad Foundation <br />
              <span className="footer-h2-span">for Athletes and Artists</span>
            </h2>
            <p className="footer-p">
              PO Box 145, Radio City Station <br />
              New York, New York 10101
            </p>
            <p className="footer-p">P: 917-334-1194</p>
            <p className="footer-p foolter-cont">E: info@chad-foundation.org</p>
            <p className="footer-p foolter-cont">W: www.chad-foundation.org</p>
            <div className="footer-social-media-icons">
              <a
                href="https://www.linkedin.com/company/thechadfoundationforathletesandartists/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={LinkedinIcon} alt="LinkedIn" width={45} />
              </a>{" "}
              <a
                href="https://www.facebook.com/profile.php?id=100063710691467"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={FacebookIcon} alt="Facebook" width={45} />
              </a>
              <a
                href="https://www.youtube.com/watch?v=zt6H5ZlXRd8"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={VideoIcon} alt="YouTube" width={45} />
              </a>
              <a
                href="https://www.instagram.com/chadfoundationathletesartists/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={InstagramIcon} alt="Instagram" width={45} />
              </a>
            </div>
          </Col>
          {/* About Us */}
          <Col md className="footer-col">
            <h3 className="footer-h3">About Us</h3>
            <NavLink
              to="/about/who-we-are"
              className="footer-p nav-link"
            >
              Who We Are
            </NavLink>
            <NavLink
              to="/about/what-weve-done"
              className="footer-p nav-link"
            >
              What We’ve Done
            </NavLink>
            <NavLink
              to="/about/testimonials"
              className="footer-p nav-link"
            >
              Testimonials
            </NavLink>
            <NavLink to="/about/board" className="footer-p nav-link">
              Board
            </NavLink>
          </Col>
          {/* Education of the Heart */}
          <Col md className="footer-col">
            <h3 className="footer-h3">Education of the Heart</h3>
            <NavLink
              to="/education-of-the-heart/heart-fact-page"
              className="footer-p nav-link"
            >
              Heart Facts
            </NavLink>
            <NavLink
              to="/education-of-the-heart/screening-home"
              className="footer-p nav-link"
            >
              Screenings
            </NavLink>
            <NavLink
              to="/education-of-the-heart/emergency-main"
              className="footer-p nav-link"
            >
              Emergencies
            </NavLink>
            <NavLink
              to="/education-of-the-heart/tips-main"
              className="footer-p nav-link"
            >
              Expert Health Tips
            </NavLink>
            <NavLink
              to="/#latest-heart-news"
              className="footer-p nav-link"
            >
              Latest Heart News
            </NavLink>
          </Col>
          {/* Gift of Art */}
          <Col md className="footer-col">
            <h3 className="footer-h3">Gift of Art</h3>
            <NavLink
              to="/gift-of-art/scholarship"
              className="footer-p nav-link"
            >
              Scholarship
            </NavLink>
            <NavLink
              to="/gift-of-art/plays"
              className="footer-p nav-link"
            >
              Plays
            </NavLink>
            <NavLink
              to="/gift-of-art/films"
              className="footer-p nav-link"
            >
              Films
            </NavLink>
            <NavLink
              to="/gift-of-art/books"
              className="footer-p nav-link"
            >
              Books
            </NavLink>
            <NavLink
              to="/gift-of-art/upcoming-events"
              className="footer-p nav-link"
            >
              Events
            </NavLink>
            <NavLink
              to="/gift-of-art/heart-stories"
              className="footer-p nav-link"
            >
              Stories of the Heart
            </NavLink>
          </Col>
          {/* People We Love */}
          <Col md className="footer-col">
            <h3 className="footer-h3">People We Love</h3>
            <NavLink
              to="/people-we-love/tributes"
              className="footer-p nav-link"
            >
              Tributes
            </NavLink>
            <NavLink
              to="/people-we-love/survivors"
              className="footer-p nav-link"
            >
              Survivors
            </NavLink>
            <h3 className="footer-h3">Resources</h3>
            <NavLink
              to="/resources/sca-and-training-resources"
              className="footer-p nav-link"
            >
              SCA, Screenings, AED & CPR
            </NavLink>
            <NavLink
              to="/resources/hospital-screening-resources"
              className="footer-p nav-link"
            >
              Hospital Screening
            </NavLink>
            <NavLink
              to="/donate-main"
              className="nav-link footer-h3"
            >
              Donate
            </NavLink>
            {/* Feedback Form Link */}
            <button
              className="feedback-link-btn"
              onClick={() => setIsFeedbackOpen(true)}
            >
              Feedback Form
            </button>
          </Col>
        </Row>
        <h3 className="footer-copyright">
          2024 Copyright. All Rights Reserved{" "}
          <span className="span-copyright"> Privacy Policy </span>{" "}
          <span> Terms of Use </span>
        </h3>
      </Container>
      {/* Feedback Form Popup */}
      {isFeedbackOpen && (
        <FeedbackForm onClose={() => setIsFeedbackOpen(false)} />
      )}
    </div>
  );
}

export default Footer;
