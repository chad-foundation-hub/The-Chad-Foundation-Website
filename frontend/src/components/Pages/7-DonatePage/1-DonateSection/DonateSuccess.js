import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import "./DonateSuccess.css";

const DonateSuccess = () => {
  useEffect(() => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        window.clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="DonateSuccess">
      <div className="main-container">
        <div className="DonateSuccess-shell">
          <div className="DonateSuccess-card">
            <div className="DonateSuccess-checkWrap" aria-hidden="true">
              <div className="DonateSuccess-check">
                <svg
                  width="26"
                  height="20"
                  viewBox="0 0 26 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 10.5L9.5 17L23 3"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <h1 className="DonateSuccess-statusTitle">Donation Complete</h1>

            <h2 className="DonateSuccess-heroTitle">Thank you for being a Heart Hero!</h2>

            <p className="DonateSuccess-subtitle">
              Your transaction was successful. 
            </p>

            <div
              className="DonateSuccess-match"
              role="region"
              aria-label="Employer matching gifts"
            >
              <h3 className="DonateSuccess-matchTitle">Double Your Impact!</h3>

              <p className="DonateSuccess-matchBody">
                Did you know many companies match their employees&apos; charitable
                contributions? You could double your gift to The Chad Foundation
                just by asking your HR department. Please check if your employer
                offers a matching gift program!
              </p>
            </div>

            <div className="DonateSuccess-actions">
              <a className="return-home-btn" href="/">
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DonateSuccess;
