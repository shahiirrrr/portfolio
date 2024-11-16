import React, { useState } from 'react'
import "./header.css";

/**
 * Header component renders the navigation header for the portfolio website.
 * It includes a logo and a toggleable navigation menu with links to different sections.
 */
const Header = () => {
    // State to manage the visibility of the navigation menu
    const [Toggle, showMenu] = useState(false);

    return (
        <header className="header">
            <nav className="nav container">
                {/* Logo linking to the homepage */}
                <a href="index.html" className="nav-logo">SHAHIR</a>

                {/* Navigation menu with dynamic class based on Toggle state */}
                <div className={Toggle ? "nav-menu show-menu" : "nav-menu"}>
                    <ul className="nav-list grid">
                        {/* Navigation links to different sections */}
                        <li className="nav-item">
                            <a href="#home" className="nav-link active-link">
                                <i className="uil uil-estate nav-icon"></i> Home
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#about" className="nav-link">
                                <i className="uil uil-user nav-icon"></i> About
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#skills" className="nav-link">
                                <i className="uil uil-file-alt nav-icon"></i> Skills
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#services" className="nav-link">
                                <i className="uil uil-briefcase-alt nav-icon"></i> Services
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#portfolio" className="nav-link">
                                <i className="uil uil-scenery nav-icon"></i> Portfolio
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#contact" className="nav-link">
                                <i className="uil uil-message nav-icon"></i> Contact
                            </a>
                        </li>
                    </ul>
                    {/* Close button for the navigation menu */}
                    <i className="uil uil-times nav-close" onClick={() => showMenu(!Toggle)}></i>
                </div>

                {/* Toggle button to show/hide the navigation menu */}
                <div className="nav-toggle" onClick={() => showMenu(!Toggle)}>
                    <i className="uil uil-apps"></i>
                </div>
            </nav>
        </header>
    );
}

export default Header;