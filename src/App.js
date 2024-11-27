import React from "react";
import "./App.css";
import Header from "./components/header/Header";
import Home from "./components/home/Home";
import About from "./components/about/About";

/**
 * The App component is the main entry point for the React application.
 *
 * @component
 * @returns {JSX.Element} The rendered React application.
 */
const App = () => {
  return (
    <>
      <Header />

      <main className="main">
        <Home />
        <About />
      </main>
    </>
  );
};

export default App;
