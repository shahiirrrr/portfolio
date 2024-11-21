import React from "react";
import "./home.css";
import Social from "./Social";
import Data from "./Data";
import ScrollDown from "./ScrollDown";

/**
 * The Home component serves as the main section of the homepage.
 * It includes social media links, a profile image, personal data, and a scroll down indicator.
 * 
 * @component
 * @returns {JSX.Element} The rendered Home section of the webpage.
 */
const Home = () => {
  return (
    <section className="home section" id="home">
      <div className="home-container container grid">
        <div className="home-content grid">
          <Social />
          <div className="home-img"></div>
          <Data />
        </div>
        <ScrollDown />
      </div>
    </section>
  );
};

export default Home;