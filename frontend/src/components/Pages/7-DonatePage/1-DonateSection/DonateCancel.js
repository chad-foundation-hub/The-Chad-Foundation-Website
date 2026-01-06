import React from "react";
import "./DonateCancel.css";

const DonateCancel = () => {
  return (
    <section className="DonateCancel">
      <div className="main-container">
        <div className="DonateCancel-shell">
          <div className="DonateCancel-card">
            <div className="DonateCancel-checkWrap" aria-hidden="true">
              <div className="DonateCancel-check">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 7L17 17"
                    stroke="white"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M17 7L7 17"
                    stroke="white"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <h1 className="DonateCancel-statusTitle">Payment Cancelled</h1>

            <h2 className="DonateCancel-heroTitle">No worries.</h2>

            <p className="DonateCancel-subtitle">
              You have not been charged. You can return to the donation page and
              try again whenever you are ready.
            </p>

            <div className="DonateCancel-actions">
              <a className="try-again-btn" href="/donate-main">
                Try Again
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DonateCancel;
