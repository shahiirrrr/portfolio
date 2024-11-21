import React from "react";
import "./App.css";
import Header from "./components/header/Header";
import Home from "./components/home/Home";

/**
 * The App component is the main entry point for the React application.
 * It renders the Header component and the Home component within a main section.
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
      </main>
    </>
  );
};

export default App;
