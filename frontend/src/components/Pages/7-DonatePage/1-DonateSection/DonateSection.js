import React, { useState } from "react";
import "./DonateSection.css";
import VolleyballImg from "../../../../images/Donate-Images/donate-volleyball-img.png";

const DonateSection = () => {
  const [paymentType, setPaymentType] = useState("one-time");
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedFund, setSelectedFund] = useState("General Donation");
  const [isFundOpen, setIsFundOpen] = useState(false);
  const [dedicationText, setDedicationText] = useState("");

  const oneTimeAmounts = [15, 20, 25, 50, 100, 200];
  const monthlyAmounts = [15, 20, 25, 50, 100, 200];

  const fundOptions = [
    "General Donation",
    "The Chad Scholarship Program",
    "The Gift of Heart Program",
    "The Gift of Art Program",
    "Life is a Gift: Safe Driver Campaign",
  ];

  const handleToggle = (type) => {
    setPaymentType(type);
    setSelectedAmount(null);
    setCustomAmount("");
  };

  const handleAmountClick = (amount) => {
    if (selectedAmount === amount) {
      setSelectedAmount(null);
      return;
    }
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomChange = (e) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(null);
  };

  const handleFundSelect = (option) => {
    setSelectedFund(option);
    setIsFundOpen(false);
  };

  const handleDedicationChange = (e) => {
    const value = e.target.value;
    const trimmed = value.trim();
    if (trimmed === "") {
      setDedicationText("");
      return;
    }
    const words = trimmed.split(/\s+/);
    if (words.length <= 100) {
      setDedicationText(value);
    } else {
      const limited = words.slice(0, 100).join(" ");
      setDedicationText(limited);
    }
  };

  const handleDonateClick = async () => {
    const finalAmount = customAmount ? Number(customAmount) : selectedAmount;

    if (!finalAmount || Number.isNaN(finalAmount) || finalAmount <= 0) {
      alert("Please select or enter a valid amount.");
      return;
    }

    const amountInCents = Math.round(finalAmount * 100);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "donation",
          amount: amountInCents,
          frequency: paymentType, // "one-time" or "monthly"
          fund: selectedFund,
          notes: dedicationText,
        }),
      });

      if (!response.ok) {
        console.error("Create checkout session failed", response.status);
        alert(
          "Something went wrong while starting your donation. Please try again.",
        );
        return;
      }

      const data = await response.json();

      if (data && data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned from backend", data);
        alert(
          "We could not start the checkout session. Please try again later.",
        );
      }
    } catch (error) {
      console.error("Error creating checkout session", error);
      alert(
        "There was a network error while starting your donation. Please try again.",
      );
    }
  };

  const amountsToRender =
    paymentType === "one-time" ? oneTimeAmounts : monthlyAmounts;

  return (
    <section className="DonateSection">
      <div className="main-container">
        <div className="donate-card">
          {/* LEFT SIDE */}
          <div className="donate-left">
            <div className="donate-text">
              <p className="donate-page-p">
                <strong>
                  Together, we can make a difference and save lives.
                </strong>
                <br />
                <br />
                Please give a Gift today to help us raise awareness of Sudden
                Cardiac Arrest in Young People and save young hearts, inner and
                outer, healthy Mind, Body, and Spirit. “The Gift of Heart and
                Art.”
              </p>
            </div>

            <img
              src={VolleyballImg}
              alt="Young athletes celebrating during a volleyball game"
              className="donate-image"
            />
          </div>

          {/* RIGHT SIDE - FORM */}
          <div className="donate-right">
            {/* Donation Type Toggle */}
            <div className="donate-toggle">
              <button
                className={`donate-toggle-option ${
                  paymentType === "one-time" ? "active" : ""
                }`}
                onClick={() => handleToggle("one-time")}
              >
                One-time
              </button>

              <button
                className={`donate-toggle-option ${
                  paymentType === "monthly" ? "active" : ""
                }`}
                onClick={() => handleToggle("monthly")}
              >
                Monthly
              </button>
            </div>

            {/* Amount Buttons */}
            <div className="donate-amount-grid">
              {amountsToRender.map((amount) => (
                <button
                  key={`${paymentType}-${amount}`}
                  className={`donate-amount-btn ${
                    selectedAmount === amount ? "selected" : ""
                  }`}
                  onClick={() => handleAmountClick(amount)}
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Custom Amount (One-time Only) */}
            <div className="donate-custom-row">
              <div className="donate-custom-box">
                <span className="donate-currency-prefix">$</span>
                <input
                  type="number"
                  min="1"
                  placeholder="Custom Amount"
                  className="donate-custom-input"
                  value={customAmount}
                  onChange={handleCustomChange}
                />
                <span className="donate-currency-code">USD</span>
              </div>
            </div>

            {/* DROPDOWN */}
            <div className="donate-fund-row">
              <label className="donate-fund-label">
                Direct my donation to:
              </label>

              <div
                className={`donate-fund-select ${isFundOpen ? "open" : ""}`}
                onClick={() => setIsFundOpen((prev) => !prev)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsFundOpen((prev) => !prev);
                  }
                }}
              >
                <span className="donate-fund-selected">{selectedFund}</span>
                <span className="donate-fund-arrow">▾</span>
              </div>

              {isFundOpen && (
                <ul className="donate-fund-options">
                  {fundOptions.map((option) => (
                    <li
                      key={option}
                      className={`donate-fund-option ${
                        option === selectedFund ? "active" : ""
                      }`}
                      onClick={() => handleFundSelect(option)}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* DEDICATION FIELD */}
            <div className="donate-dedication-row">
              <label className="donate-dedication-label">
                Dedication / In Memory Of:
              </label>
              <textarea
                className="donate-dedication-input"
                value={dedicationText}
                onChange={handleDedicationChange}
                placeholder="Optionally, you can add a short dedication or in memory note here."
              />
            </div>

            {/* CTA */}
            <button className="donate-cta" onClick={handleDonateClick}>
              Give to Save Lives
            </button>

            {/* EMPLOYER MATCHING NOTE */}
            <p className="donate-matching-note">
              Did you know? Many employers match donations. Check with your HR
              department!
            </p>
          </div>
        </div>
        <div className="donate-banner">
          <p>
            By donating to The Chad Foundation for Athletes and Artists, a
            non-profit, 501(c)(3) tax-exempt charitable organization, you
            receive the benefit of tax-deductible donations while supporting the
            foundation’s mission: to safeguard young hearts, instill a “Heart
            Healthy Lifestyle—in Mind, Body, and Spirit,” inspire young hearts
            and minds to be ‘the best’ they can be through the “Gift of Art,”
            and the “Annual Chad Scholarship Program” which supports young
            dreams.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DonateSection;
