import React from "react";

/**
 * Info component
 *
 * This component displays information about the developer's experience,
 * completed projects, and support availability.
 *
 * @returns {JSX.Element} A div containing three boxes with icons, titles,
 * and subtitles representing the developer's experience, completed projects,
 * and support availability.
 */
const Info = () => {
  return (
    <div className="about-info grid">
      <div className="about-box">
        <i class="bx bx-award about-icon"></i>
        <h3 className="about-title">Experience</h3>
        <span className="about-subtitle">1 Years Working</span>
      </div>
      <div className="about-box">
        <i class="bx bx-briefcase-alt about-icon"></i>
        <h3 className="about-title">Completed</h3>
        <span className="about-subtitle">8 + Projects</span>
      </div>
      <div className="about-box">
        <i class="bx bx-support about-icon"></i>
        <h3 className="about-title">Support</h3>
        <span className="about-subtitle">Online 24/7</span>
      </div>
    </div>
  );
};

export default Info;
