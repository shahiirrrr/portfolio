import React from 'react'

/**
 * Social component
 * 
 * This component renders social media links with icons.
 * It includes links to Instagram, LinkedIn, and GitHub profiles.
 * Each link opens in a new tab when clicked.
 * 
 * @returns {JSX.Element} A div containing social media links
 */
const Social = () => {
    return (
        <div className="home-social">
            <a href="https://www.instagram.com/shahiirrrr/" className="home-social-icon" target="_blank">
                <i class="uil uil-instagram"></i>
            </a>
            <a href="https://www.linkedin.com/in/shahir-farhan-89443b2a9" className="home-social-icon" target="_blank">
            <i class="uil uil-linkedin-alt"></i>
            </a>
            <a href="https://github.com/shahiirrrr/" className="home-social-icon" target="_blank">
                <i class="uil uil-github-alt"></i>
            </a>
        </div>
    )
}

export default Social