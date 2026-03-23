import './index.css'
import { motion } from 'framer-motion'
import { useMemo, useEffect, useRef } from 'react'
import gsap from 'gsap'

function App() {
  const name = 'SHAHIR FARHAN'
  const nameWords = useMemo(() => name.split(' '), [name])
  const roles = useMemo(() => ['Software Developer', 'Frontend Developer'], [])
  const logos = useMemo(() => ([
    { name: 'React', url: 'https://cdn.simpleicons.org/react/61dafb' },
    { name: 'Next.js', url: 'https://cdn.simpleicons.org/nextdotjs/FFFFFF' },
    { name: 'JavaScript', url: 'https://cdn.simpleicons.org/javascript/f7df1e' },
    { name: 'TypeScript', url: 'https://cdn.simpleicons.org/typescript/3178c6' },
    { name: 'Python', url: 'https://cdn.simpleicons.org/python/3776AB' },
    { name: 'Tailwind', url: 'https://cdn.simpleicons.org/tailwindcss/38bdf8' },
    { name: 'Bootstrap', url: 'https://cdn.simpleicons.org/bootstrap/7952B3' },
    { name: 'Shadcn UI', text: 'shadcn/ui' },
    { name: 'BigCommerce', url: 'https://cdn.simpleicons.org/bigcommerce/98a2b3' },
    { name: 'Stencil', url: 'https://cdn.simpleicons.org/stencil/0055FF' },
    { name: 'HTML5', url: 'https://cdn.simpleicons.org/html5/E34F26' },
    { name: 'CSS3', component: CSSIcon },
    { name: 'SCSS', url: 'https://cdn.simpleicons.org/sass/CC6699' },
    { name: 'Flask', url: 'https://cdn.simpleicons.org/flask/FFFFFF' },
    { name: 'Git', url: 'https://cdn.simpleicons.org/git/f97316' },
    { name: 'Django', url: 'https://cdn.simpleicons.org/django/86efac' },
    { name: 'MongoDB', url: 'https://cdn.simpleicons.org/mongodb/84cc16' },
    { name: 'MySQL', url: 'https://cdn.simpleicons.org/mysql/60a5fa' },
    { name: 'GraphQL', url: 'https://cdn.simpleicons.org/graphql/f0abfc' },
  ]), [])
  const heroStats = useMemo(() => ([
    { label: 'Experience', value: '2+ yrs' },
    { label: 'Commerce builds', value: '3 headless stores' },
    { label: 'Projects shipped', value: '2+ launches' },
  ]), [])
  const aboutHighlights = useMemo(() => ([
    {
      title: 'Headless Commerce',
      description: 'Building composable storefronts with React, Storefront APIs, and micro frontends that scale.',
    },
    {
      title: 'Experience Ops',
      description: 'Cross-functional collaboration with product owners, QA, and designers using Agile rituals.',
    },
    {
      title: 'Performance First',
      description: 'Obsessed with accessibility, Core Web Vitals, and maintaining pixel-crisp UI systems.',
    },
  ]), [])
  const doodleFields = useMemo(() => ({
    about: [
      { id: 'about-circle', type: 'circle', top: '6%', left: '8%', size: 54, background: 'linear-gradient(135deg, rgba(56,189,248,0.3), rgba(56,189,248,0))', float: { x: 12, y: 16 }, blur: true },
      { id: 'about-triangle', type: 'triangle', top: '55%', left: '4%', size: 36, color: 'rgba(233, 196, 106, 0.45)', rotate: 12, float: { x: 8, y: 10 } },
      { id: 'about-bracket', type: 'brackets', top: '18%', left: '78%', size: 44, color: 'rgba(255,255,255,0.35)', float: { x: 14, y: 12 } },
    ],
    experience: [
      { id: 'exp-spark', type: 'spark', top: '8%', left: '85%', size: 40, color: 'rgba(244,114,182,0.35)', float: { x: 10, y: 14 } },
      { id: 'exp-circle', type: 'circle', top: '65%', left: '6%', size: 46, background: 'radial-gradient(circle at 30% 30%, rgba(192,132,252,0.35), rgba(192,132,252,0))', float: { x: 12, y: 10 } },
      { id: 'exp-line', type: 'line', top: '24%', left: '12%', size: 48, color: 'rgba(255,255,255,0.2)', rotate: -18, float: { x: 6, y: 16 } },
    ],
    education: [
      { id: 'edu-triangle', type: 'triangle', top: '10%', left: '10%', size: 32, color: 'rgba(94,234,212,0.4)', rotate: -6, float: { x: 12, y: 12 } },
      { id: 'edu-circle', type: 'circle', top: '72%', left: '88%', size: 52, background: 'linear-gradient(135deg, rgba(125,211,252,0.28), rgba(125,211,252,0))', float: { x: 16, y: 12 }, blur: true },
      { id: 'edu-brackets', type: 'brackets', top: '32%', left: '76%', size: 38, color: 'rgba(255,255,255,0.28)', float: { x: 10, y: 8 } },
    ],
    skills: [
      { id: 'skills-circle', type: 'circle', top: '8%', left: '80%', size: 48, background: 'linear-gradient(135deg, rgba(248,113,113,0.28), rgba(248,113,113,0))', float: { x: 14, y: 12 } },
      { id: 'skills-spark', type: 'spark', top: '70%', left: '12%', size: 34, color: 'rgba(250,204,21,0.4)', float: { x: 10, y: 14 } },
    ],
    projects: [
      { id: 'proj-triangle', type: 'triangle', top: '12%', left: '6%', size: 34, color: 'rgba(96,165,250,0.4)', rotate: -10, float: { x: 12, y: 14 } },
      { id: 'proj-circle', type: 'circle', top: '62%', left: '92%', size: 60, background: 'radial-gradient(circle, rgba(244,63,94,0.25), rgba(244,63,94,0))', float: { x: 18, y: 16 }, blur: true },
      { id: 'proj-line', type: 'line', top: '30%', left: '78%', size: 46, color: 'rgba(255,255,255,0.22)', rotate: 14, float: { x: 8, y: 18 } },
    ],
    recommendations: [
      { id: 'rec-circle', type: 'circle', top: '12%', left: '12%', size: 50, background: 'linear-gradient(135deg, rgba(244,114,182,0.28), rgba(59,130,246,0.28))', float: { x: 12, y: 12 }, blur: true },
      { id: 'rec-line', type: 'line', top: '65%', left: '8%', size: 42, color: 'rgba(255,255,255,0.18)', rotate: -18, float: { x: 10, y: 16 } },
      { id: 'rec-spark', type: 'spark', top: '24%', left: '86%', size: 36, color: 'rgba(52,211,153,0.32)', float: { x: 12, y: 10 } },
    ],
    contact: [
      { id: 'contact-circle', type: 'circle', top: '12%', left: '80%', size: 52, background: 'linear-gradient(135deg, rgba(52,211,153,0.3), rgba(52,211,153,0))', float: { x: 12, y: 14 }, blur: true },
      { id: 'contact-spark', type: 'spark', top: '68%', left: '8%', size: 36, color: 'rgba(147,197,253,0.4)', float: { x: 10, y: 12 } },
    ],
  }), [])
  const certifications = useMemo(() => ([
    {
      id: 'bsc-cs',
      title: 'B.Sc. in Computer Science',
      issuer: 'University of Calicut – CM College of Arts and Science, Nadavayal',
      issued: '2021 – 2023',
      summary: 'Graduated with a Bachelor of Science degree in Computer Science, focusing on software development, algorithms, and computer systems.',
      skills: ['Computer Science Fundamentals', 'Programming', 'Data Structures', 'Algorithms'],
      logo: {
        image: 'calicut_university.jpeg',
        bg: 'bg-white',
        border: 'border-white/20'
      },
    },
    {
      id: 'synnefo-cert',
      title: 'Python Full Stack Web Development',
      issuer: 'Synnefo Solutions',
      issued: 'Issued Dec 2023',
      credentialText: 'Show credential',
      credentialUrl: 'https://synnefo.in',
      summary: 'Successfully completed a comprehensive training program covering front-end, back-end, and database development conducted from June 21, 2023 to November 21, 2023 by Synnefo Solutions, Cochin.',
      skills: ['Python', 'Django', 'REST APIs', 'Frontend Development'],
      logo: {
        image: 'synnefo_solutions.jpeg',
        bg: 'bg-white',
        border: 'border-white/20'
      },
    },
    {
      id: 'jetking-workshop',
      title: 'Jetking "WOW" Workshop on Cloud Computing & Cyber Security',
      issuer: 'Jetking Infotrain Limited',
      issued: 'Issued Jul 2023',
      credentialText: 'Show credential',
      credentialUrl: 'https://www.jetking.com',
      summary: 'Participated in a specialized workshop focusing on fundamentals and practical aspects of Cloud Computing and Cyber Security led by industry experts from Jetking Infotrain Ltd.',
      skills: ['Cloud Computing', 'Cybersecurity'],
      logo: {
        image: 'jetking.png',
        bg: 'bg-white',
        border: 'border-white/20'
      },
    },
    {
      id: 'regional-tech',
      title: 'Web Development Workshop',
      issuer: 'Regional Technologies',
      issued: 'Issued Jun 2023',
      summary: 'Participated in a hands-on web development workshop covering modern frontend technologies and best practices.',
      skills: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
      logo: {
        image: 'regional-technologies.avif',
        bg: 'bg-white',
        border: 'border-white/20'
      },
    },
  ]), [])
  const projects = useMemo(() => ([
    {
      title: 'Habit Tracker',
      summary: 'Daily habit tracking app with streak insights and responsive UI.',
      tags: ['React', 'Tailwind', 'Vercel'],
      links: [
        { label: 'Live', href: 'https://habit-tracker-blush-ten.vercel.app/' },
        { label: 'GitHub', href: 'https://github.com/shahiirrrr/habit-tracker-react' },
      ],
    },
    {
      title: 'Topbar Utility Suite',
      summary: 'Reusable topbar widgets and utilities for BigCommerce storefronts.',
      tags: ['BigCommerce', 'React', 'Utility'],
      links: [
        { label: 'GitHub', href: 'https://github.com/shahiirrrr/topbar-utility-bigcommecre' },
      ],
    },
    {
      title: 'Currency Converter',
      summary: 'Python CLI tool that fetches real-time FX rates with caching.',
      tags: ['Python', 'Requests', 'CLI'],
      links: [
        { label: 'GitHub', href: 'https://github.com/shahiirrrr/currency-converter-using-python' },
      ],
    },
    {
      title: 'Tours & Travels',
      summary: 'Travel booking experience focusing on itinerary discovery and conversion.',
      tags: ['React', 'UX', 'Travel'],
      links: [
        { label: 'GitHub', href: 'https://github.com/shahiirrrr/tours-travels' },
      ],
    },
    {
      title: 'Headless E-commerce',
      summary: 'Composable ecommerce storefront with reusable UI kit and CMS integrations.',
      tags: ['React', 'Headless', 'Commerce'],
      links: [
        { label: 'GitHub', href: 'https://github.com/shahiirrrr/ecommerce-website-react' },
      ],
    },
    {
      title: 'Clinic Calendar',
      summary: 'Scheduling interface to streamline clinic appointments and reminders.',
      tags: ['React', 'Calendar', 'UI'],
      links: [
        { label: 'GitHub', href: 'https://github.com/shahiirrrr/clinic-calendar' },
      ],
    },
    {
      title: 'Love Confession Game',
      summary: 'Playful interactive experiment built in Python for fun confessions.',
      tags: ['Python', 'Interactive'],
      links: [
        { label: 'GitHub', href: 'https://github.com/shahiirrrr/love-confession-game' },
      ],
    },
    {
      title: 'Nextbase Storefront',
      summary: 'Customized BigCommerce theme with PHF integration for Nextbase.',
      tags: ['BigCommerce', 'React', 'Stencil JS'],
      links: [
        { label: 'Live', href: 'https://nextbase.co.uk' },
      ],
    },
    {
      title: 'Intelligent Yoga Coaching System',
      summary: 'Posture recognition system with Android/web clients and real-time feedback.',
      tags: ['Python', 'Computer Vision', 'Health'],
      links: [
        { label: 'Case Study', href: 'https://shahir.vercel.app' },
      ],
    },
  ]), [])
  const recommendations = useMemo(() => ([
    {
      name: 'Muhammed Fazil',
      title: 'Full Stack Engineer | BigCommerce Background | Web Development Expert',
      relationship: 'Mentor • Sep 30, 2025',
      quote: 'I had the pleasure of mentoring Shahir, and he was one of the most driven and curious individuals I’ve worked with. He cared about doing things the right way, always thinking ahead about reusability, scale, and improvement.',
      highlight: '“He always thought ahead — asking ‘Is this reusable? Can this scale?’ That mindset is rare and invaluable.”',
      avatar: null,
    },
    {
      name: 'Hashil Nisam',
      title: 'Software Developer | React, BigCommerce & Laravel Expert',
      relationship: 'Teammate • Sep 30, 2025',
      quote: 'We worked together on a BigCommerce Stencil project where he mentored me in React and Stencil basics while bringing incredible problem-solving skills. Shahir is always ready to help and manage challenges efficiently.',
      highlight: '“He mentored me through React & Stencil foundations and tackled challenges with calm confidence.”',
      avatar: null,
    },
  ]), [])
  const ambientDoodles = useMemo(() => ([
    { id: 'ambient-1', type: 'circle', top: '8%', left: '18%', size: 80, background: 'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(56,189,248,0))', float: { x: 16, y: 14 }, blur: true },
    { id: 'ambient-2', type: 'triangle', top: '28%', left: '88%', size: 46, color: 'rgba(244,114,182,0.28)', rotate: 12, float: { x: 12, y: 18 } },
    { id: 'ambient-3', type: 'spark', top: '46%', left: '10%', size: 42, color: 'rgba(251,191,36,0.3)', float: { x: 10, y: 16 } },
    { id: 'ambient-4', type: 'line', top: '62%', left: '82%', size: 60, color: 'rgba(255,255,255,0.12)', rotate: -18, float: { x: 14, y: 18 } },
    { id: 'ambient-5', type: 'circle', top: '78%', left: '26%', size: 70, background: 'linear-gradient(135deg, rgba(147,197,253,0.22), rgba(147,197,253,0))', float: { x: 12, y: 14 }, blur: true },
  ]), [])

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans relative">
      <BackgroundFX />
      <DoodleField items={ambientDoodles} className="hidden md:block" />
      {/* Hero */}
      <section id="home" className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden px-6 pt-20 sm:pt-0">
        {/* Faint giant initials as backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.04 }}
          transition={{ duration: 1.2 }}
          className="pointer-events-none select-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <div className="text-[18vw] leading-none tracking-tight font-extrabold">
            {name.split(' ')[0]}
          </div>
        </motion.div>

        <div className="relative z-10 w-full max-w-6xl">
          <motion.h1
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
            className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight leading-[0.95]"
          >
            {nameWords.map((word, wi) => (
              <span
                key={`${word}-${wi}`}
                className="block md:inline-block md:mr-4"
              >
                {Array.from(word).map((ch, i) => (
                  <motion.span
                    key={`${word}-${i}-${ch}`}
                    variants={{ hidden: { y: 24, opacity: 0 }, show: { y: 0, opacity: 1 } }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-neutral-100 to-neutral-400"
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>
            ))}
          </motion.h1>
          {/* Hand-drawn underline doodle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-3"
            aria-hidden
          >
            <svg width="420" height="22" viewBox="0 0 420 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-full">
              <path d="M2 12 C80 2, 140 20, 220 10 S360 20, 418 8" stroke="url(#g1)" strokeWidth="3" className="dash-anim" strokeLinecap="round" />
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="420" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#e5e5e5" />
                  <stop offset="1" stopColor="#9ca3af" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-6 text-lg md:text-xl text-neutral-300 max-w-2xl"
          >
            Detail‑oriented developer skilled in modern frontend and headless commerce.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-8 flex flex-wrap items-center gap-3 md:gap-4"
          >
            <SocialIcon href="https://github.com/shahiirrrr" label="GitHub">
              <IconGithub />
            </SocialIcon>
            <SocialIcon href="https://linkedin.com/in/shahiirrrr" label="LinkedIn">
              <IconLinkedIn />
            </SocialIcon>
            <SocialIcon href="mailto:shahirp.official@gmail.com" label="Email">
              <IconMail />
            </SocialIcon>
            <a
              href="/ShahirFarhan.pdf"
              download="ShahirFarhan_Resume.pdf"
              className="md:ml-auto inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2.5 font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
            >
              Resume
            </a>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } },
            }}
            className="mt-10 flex flex-wrap gap-2 text-sm text-neutral-400"
            aria-label="Roles"
          >
            {roles.map((r) => (
              <motion.span
                key={r}
                variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
                className="px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/50"
              >
                {r}
              </motion.span>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' }}
            className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <p className="text-2xl font-semibold text-neutral-100">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.3em] text-neutral-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
        <DoodlesHero />
      </section>

      {/* About */}
      <motion.section
        id="about"
        className="px-6 py-16 md:py-24 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] px-6 md:px-10 py-12">
          <DoodleField items={doodleFields.about} />
          <SectionHeading
            eyebrow="Who I am"
            title="About"
            description="Frontend-heavy full stack developer specialising in headless commerce builds and crafted user journeys."
          />
          <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="space-y-5 text-neutral-300 leading-relaxed">
              <p>
                Detail-oriented Software Developer with a focus on building performant, accessible experiences for modern commerce platforms.
                I balance craft and velocity—modern React architectures, API integrations, and design systems that stay maintainable as they scale.
              </p>
              <p>
                I thrive in collaborative teams, using agile rhythms, analytics, and rapid experimentation to align shipping velocity with business goals.
                From solving micro frontend orchestration to optimising storefront vitals, I bring calm energy and curiosity to every release.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 text-sm text-neutral-300/90">
                {[
                  { label: 'Base', value: 'Wayanad, Kerala, India' },
                  { label: 'Phone', value: '+91 88918 73321' },
                  { label: 'Email', value: 'shahirp.official@gmail.com', isLink: true, href: 'mailto:shahirp.official@gmail.com' },
                  { label: 'Timezone', value: 'IST (UTC +5:30)' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">{item.label}</p>
                    {item.isLink ? (
                      <a href={item.href} className="mt-1 block text-sm text-neutral-100 hover:text-sky-200">
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-neutral-100">{item.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {aboutHighlights.map((highlight) => (
                <div key={highlight.title} className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <p className="text-sm font-semibold text-neutral-100">{highlight.title}</p>
                  <p className="mt-2 text-sm text-neutral-300 leading-relaxed">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Experience */}
      <motion.section
        id="experience"
        className="px-6 py-16 md:py-24 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] px-6 md:px-10 py-12">
          <DoodleField items={doodleFields.experience} />
          <SectionHeading
            eyebrow="In practice"
            title="Experience"
            description="Shipping production-ready experiences across headless storefronts, platform migrations, and applied R&D."
          />
          <div className="mt-10 grid gap-6">
            <ExperienceItem
              title="Frontend Developer"
              company="Noviindus Technologies"
              location="Kozhikode, Kerala"
              time="Dec 2025 – Present"
              bullets={[
                'Building modern web applications using Next.js and Tailwind CSS.',
                'Developing performant, scalable frontend solutions for client projects.',
              ]}
            />
            <ExperienceItem
              title="Software Developer"
              company="Neopraxis Innovations Pvt Ltd"
              location="Wayanad, Kerala"
              time="Mar 2024 – Oct 2025"
              bullets={[
                'Delivered BigCommerce B2B Edition storefront for Nextbase.',
                'Implemented headless architecture using React and Storefront APIs.',
                'Customized Cornerstone theme and solved Micro Frontends integration issues.',
                'Integrated PHF with RS Connect, Fetchify, and DVLC.',
              ]}
            />
            <ExperienceItem
              title="Intern – Python/Django Developer"
              company="Synnefo Solutions"
              location="Kochi, Kerala"
              time="Aug 2023 – Jan 2024"
              bullets={[
                'Contributed to eCommerce web apps using Python, Django, RESTful APIs.',
                'Worked with MySQL databases and improved debugging/testing practices.',
              ]}
            />
            <ExperienceItem
              title="Trainee"
              company="Regional Technologies"
              location="Kozhikode, Kerala"
              time="Dec 2022 – Jan 2023"
              bullets={[
                'Built posture recognition-based yoga system with Android and web interfaces.',
              ]}
            />
          </div>
        </div>
      </motion.section>

      {/* Education & Certifications */}
      <motion.section
        id="education"
        className="px-6 py-16 md:py-24 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] px-6 md:px-10 py-12">
          <DoodleField items={doodleFields.education} />
          <SectionHeading
            eyebrow="Always learning"
            title="Education & Certifications"
            description="Upskilling through focused programs and workshops keeps my toolkit sharp and industry-relevant."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {certifications.map((cert) => (
              <CertificationCard key={cert.id} cert={cert} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Skills slider */}
      <motion.section
        id="skills"
        className="px-6 py-16 md:py-24 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] px-6 md:px-10 py-12">
          <DoodleField items={doodleFields.skills} />
          <SectionHeading
            eyebrow="Toolkit"
            title="Skills"
            description="A blend of frontend craft, commerce integrations, and platform tooling that keep products resilient."
          />
          <InfiniteGSAPSlider
            items={logos}
            className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur px-6 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          />
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.02] px-6 py-6 md:px-8 md:py-8">
            <p className="text-sm md:text-base text-neutral-300 leading-relaxed italic">
              “We are what we repeatedly do. Excellence, then, is not an act, but a habit.”
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-neutral-500">
              Aristotle
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Capabilities</p>
              <ul className="mt-4 space-y-3 text-neutral-300 text-sm">
                {[
                  'Design and build headless storefronts',
                  'Performance, accessibility, and UX audits',
                  'UI systems and component libraries',
                  'API integration and edge cases',
                  'CI-friendly dev workflows',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 text-emerald-300">
                      <IconCheck />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Tooling I use</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  'React', 'Next.js', 'Vite', 'Tailwind', 'shadcn/ui', 'GSAP', 'Framer Motion',
                  'BigCommerce', 'Stencil', 'Django', 'Flask', 'Node.js',
                  'GitHub', 'Trello', 'Notion', 'Zoho Sprints',
                ].map((tool) => (
                  <span key={tool} className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-neutral-200">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Projects */}
      <motion.section
        id="projects"
        className="px-6 py-16 md:py-24 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] px-6 md:px-10 py-12">
          <DoodleField items={doodleFields.projects} />
          <SectionHeading
            eyebrow="Selected work"
            title="Projects"
            description="A sample of builds spanning headless commerce, intelligent tooling, and full-stack delivery."
          />
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Recommendations */}
      <motion.section
        id="recommendations"
        className="px-6 py-16 md:py-24 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] px-6 md:px-10 py-12">
          <DoodleField items={doodleFields.recommendations} />
          <SectionHeading
            eyebrow="What teammates say"
            title="Recommendations"
            description="A glimpse at how colleagues describe partnering with me across mentorship, delivery, and team problem-solving."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.name} {...rec} />
            ))}
          </div>
          <div className="mt-8 flex justify-end">
            <a
              href="https://linkedin.com/in/shahiirrrr"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs uppercase tracking-[0.3em] text-neutral-200 hover:bg-white/10"
            >
              View more on LinkedIn
              <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </motion.section>

      {/* Contact */}
      <motion.section
        id="contact"
        className="px-6 py-16 md:py-24 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] px-6 md:px-10 py-12">
          <DoodleField items={doodleFields.contact} />
          <SectionHeading
            eyebrow="Let's collaborate"
            title="Contact"
            description="Open to full-time roles or short engagements where thoughtful frontend craft and product-minded thinking matter."
          />
          <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5 text-neutral-300 leading-relaxed">
              <p>
                I enjoy joining teams early enough to influence direction and craft, but late enough that impact is visible quickly.
                Whether you need a headless storefront partner, frontend lead, or an engineer who can bridge design conversations—let’s talk.
              </p>
              <ul className="grid gap-3 text-sm sm:grid-cols-2">
                {[
                  'Headless / composable commerce builds',
                  'Design system implementation & audits',
                  'High-performing marketing sites',
                  'Frontend mentoring and pairing',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-neutral-100">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-300" />
                    <span className="text-neutral-300">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:shahirp.official@gmail.com"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2.5 font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
                >
                  Say hello
                  <span aria-hidden className="text-base">✉️</span>
                </a>
                <a
                  href="https://linkedin.com/in/shahiirrrr"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-neutral-100 hover:border-white/40"
                >
                  Connect on LinkedIn
                </a>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Direct lines</p>
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <p className="text-neutral-400">Email</p>
                  <a href="mailto:shahirp.official@gmail.com" className="text-neutral-100 hover:text-sky-200">
                    shahirp.official@gmail.com
                  </a>
                </div>
                <div>
                  <p className="text-neutral-400">LinkedIn</p>
                  <a href="https://linkedin.com/in/shahiirrrr" target="_blank" rel="noreferrer" className="text-neutral-100 hover:text-sky-200">
                    linkedin.com/in/shahiirrrr
                  </a>
                </div>
                <div>
                  <p className="text-neutral-400">Phone / WhatsApp</p>
                  <a href="https://wa.me/918891873321" target="_blank" rel="noreferrer" className="text-neutral-100 hover:text-sky-200">
                    +91 88918 73321
                  </a>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-neutral-400">
                <p>Preferred collaboration modes:</p>
                <p className="mt-1 text-neutral-300">Remote-first, async-friendly teams working on commerce, product, or platform initiatives.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-neutral-900 text-neutral-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-4 justify-between">
          <p className="text-sm">&copy; {new Date().getFullYear()} Shahir Farhan</p>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#home" className="hover:text-white">Home</a>
            <a href="#about" className="hover:text-white">About</a>
            <a href="#experience" className="hover:text-white">Experience</a>
            <a href="#education" className="hover:text-white">Education</a>
            <a href="#skills" className="hover:text-white">Skills</a>
            <a href="#projects" className="hover:text-white">Projects</a>
            <a href="#recommendations" className="hover:text-white">Recommendations</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </nav>
        </div>
      </footer>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <div className="bg-white/[0.08] backdrop-blur-md border border-white/10 rounded-full px-2 py-2 flex items-center gap-1 shadow-lg">
          {[
            { href: '#home', label: 'Home', icon: <IconHome /> },
            { href: '#about', label: 'About', icon: <IconUser /> },
            { href: '#experience', label: 'Exp', icon: <IconBriefcase /> },
            { href: '#education', label: 'Edu', icon: <IconBook /> },
            { href: '#skills', label: 'Skills', icon: <IconSparkles /> },
            { href: '#projects', label: 'Work', icon: <IconGrid /> },
            { href: '#contact', label: 'Contact', icon: <IconMail /> },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-full text-neutral-100/90 hover:bg-white/10 hover:text-neutral-100 transition"
              aria-label={item.label}
            >
              <div className="h-5 w-5">{item.icon}</div>
            </a>
          ))}
        </div>
      </nav>

      {/* Floating WhatsApp button */}
      <SocialDock />
    </div>
  )
}

export default App

function ExperienceItem({ title, company, location, time, bullets }) {
  return (
    <div className="relative pl-8 pb-8 border-l-2 border-white/10 last:border-transparent last:pb-0 group">
      <div className="absolute left-0 top-0 w-4 h-4 -translate-x-[9px] rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 group-hover:shadow-[0_0_0_4px_rgba(99,102,241,0.2)] transition-all" />
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <div className="text-sm text-neutral-400">{time}</div>
      </div>
      <p className="text-blue-300 font-medium">{company} • {location}</p>
      <ul className="mt-4 list-disc list-inside space-y-2 text-neutral-300">
        {bullets.map((bullet, i) => (
          <li key={i} className="text-sm leading-relaxed">
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ProjectCard({ title, summary, tags = [], links = [] }) {
  return (
    <motion.div
      className="group relative flex flex-col h-full bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1]
          }
        }
      }}
      whileHover={{
        y: -5,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: {
          duration: 0.2,
          ease: 'easeOut'
        }
      }}
    >
      <h3 className="text-lg font-medium text-white mb-2 group-hover:text-blue-300 transition-colors">{title}</h3>
      <p className="text-neutral-300 text-sm mb-4 flex-grow group-hover:text-white/80 transition-colors">{summary}</p>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <motion.span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-neutral-300 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tag}
            </motion.span>
          ))}
        </div>
      )}

      {links.length > 0 && (
        <motion.div
          className="mt-auto pt-4 border-t border-white/5 group-hover:border-white/20 transition-colors"
          initial={{ opacity: 0.8 }}
          whileHover={{ opacity: 1 }}
        >
          <div className="flex flex-wrap gap-3">
            {links.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.label}
                <svg
                  className="ml-1 w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </motion.a>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function CertificationCard({ cert }) {
  const { title, issuer, issued, summary, skills = [], logo, credentialText, credentialUrl } = cert;

  return (
    <motion.div
      className="group relative flex flex-col h-full bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1]
          }
        }
      }}
      whileHover={{
        y: -5,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: {
          duration: 0.2,
          ease: 'easeOut'
        }
      }}
    >
      <div className="flex items-start gap-4">
        {logo ? (
          <div className={`flex-shrink-0 h-12 w-12 rounded-lg ${logo.bg || 'bg-white/5'} ${logo.border ? 'border ' + logo.border : ''} flex items-center justify-center overflow-hidden`}>
            <img
              src={`/${logo.image}`}
              alt={issuer}
              className="w-full h-full object-contain p-1.5"
            />
          </div>
        ) : (
          <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="text-lg font-semibold text-white">
              {issuer ? issuer.charAt(0) : 'C'}
            </span>
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-medium text-white group-hover:text-blue-300 transition-colors">{title}</h3>
          <p className="text-sm text-neutral-400">{issuer}</p>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wide">{issued}</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-neutral-300 leading-relaxed">
        {summary}
      </p>

      {skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <motion.span
              key={skill}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-neutral-300 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {skill}
            </motion.span>
          ))}
        </div>
      )}

      {credentialText && credentialUrl && (
        <motion.div className="mt-4 pt-4 border-t border-white/5 group-hover:border-white/20 transition-colors">
          <a
            href={credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            {credentialText}
            <svg
              className="ml-1 w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </motion.div>
      )}
    </motion.div>
  );
}

function RecommendationCard({ name, title, relationship, quote, highlight, avatar }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-7 backdrop-blur relative overflow-hidden">
      <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-white/[0.02]" aria-hidden />
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-sm font-semibold text-neutral-200">
          {avatar ? <img src={avatar} alt={name} className="h-full w-full rounded-full object-cover" /> : name.charAt(0)}
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">LinkedIn</p>
          <p className="mt-1 text-lg font-semibold text-neutral-50">{name}</p>
          <p className="text-sm text-neutral-300">{title}</p>
          <p className="mt-1 text-xs text-neutral-500">{relationship}</p>
        </div>
      </div>
      {highlight && (
        <p className="mt-6 text-neutral-200 text-sm leading-relaxed italic flex gap-2">
          <span className="text-sky-300">
            <IconQuote />
          </span>
          {highlight}
        </p>
      )}
      <p className="mt-4 text-sm text-neutral-300 leading-relaxed">
        {quote}
      </p>
    </div>
  )
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div>
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">{eyebrow}</p>
      )}
      <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-neutral-100">{title}</h2>
      {description && (
        <p className="mt-4 max-w-2xl text-sm md:text-base text-neutral-300 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}

function DoodleField({ items = [], className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      items.forEach((item, idx) => {
        const target = ref.current?.querySelector(`[data-doodle="${item.id ?? idx}"]`)
        if (!target) return
        const moveX = item.float?.x ?? 12
        const moveY = item.float?.y ?? 12
        gsap.to(target, {
          x: `+=${moveX}`,
          y: `+=${moveY}`,
          rotation: item.rotate ?? 0,
          duration: item.duration ?? 6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: idx * 0.25,
          transformOrigin: '50% 50%',
        })
      })
    }, ref)

    return () => ctx.revert()
  }, [items])

  return (
    <div ref={ref} className={`pointer-events-none absolute inset-0 z-0 ${className}`} aria-hidden>
      {items.map((item, idx) => {
        const size = typeof item.size === 'number' ? `${item.size}px` : item.size
        return (
          <div
            key={item.id ?? idx}
            data-doodle={item.id ?? idx}
            className={`absolute ${item.blur ? 'blur-lg' : ''}`}
            style={{
              top: item.top,
              left: item.left,
              width: size,
              height: size,
              transform: 'translate(-50%, -50%)',
              opacity: item.opacity ?? 0.8,
              zIndex: 0,
              position: 'absolute',
              pointerEvents: 'none'
            }}
          >
            {renderDoodleShape(item)}
          </div>
        )
      })}
    </div>
  )
}

function renderDoodleShape(item) {
  const color = item.color || 'rgba(255,255,255,0.35)'
  switch (item.type) {
    case 'circle':
      return (
        <div
          className="h-full w-full rounded-full"
          style={{ background: item.background || color, border: item.border }}
        />
      )
    case 'triangle':
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <polygon points="50 10, 92 90, 8 90" fill={color} />
        </svg>
      )
    case 'spark':
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <path
            d="M50 0 L62 34 L98 50 L62 66 L50 100 L38 66 L2 50 L38 34 Z"
            fill={color}
          />
        </svg>
      )
    case 'line':
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <line x1="10" y1="90" x2="90" y2="10" stroke={color} strokeWidth="8" strokeLinecap="round" />
        </svg>
      )
    case 'brackets':
      return (
        <svg viewBox="0 0 120 120" width="100%" height="100%">
          <path
            d="M30 20 L20 20 L20 100 L30 100 M90 20 L100 20 L100 100 L90 100"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <circle cx="50" cy="50" r="48" fill={color} />
        </svg>
      )
  }
}

function InfiniteSlider({ items }) {
  // Deprecated
  return null
}

function InfiniteGSAPSlider({ items, className = '' }) {
  const containerRef = useRef(null)
  const trackRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track) return

    // Duplicate items once to create seamless loop
    const children = Array.from(track.children)
    children.forEach((el) => {
      track.appendChild(el.cloneNode(true))
    })

    // Measure total width of first sequence
    const firstHalfWidth = children.reduce((acc, el) => acc + el.getBoundingClientRect().width, 0) + (children.length - 1) * 64 /* gap-16 */

    // Start marquee from 0 to -firstHalfWidth and loop
    const tween = gsap.to(track, {
      x: -firstHalfWidth,
      duration: 20,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x) => {
          // wrap value so it loops seamlessly
          const w = firstHalfWidth
          const nx = ((parseFloat(x) % -w) + 0) // keep negative movement
          return nx
        }),
      },
    })

    // Pause on hover for better UX
    const onEnter = () => tween.pause()
    const onLeave = () => tween.play()
    container.addEventListener('mouseenter', onEnter)
    container.addEventListener('mouseleave', onLeave)

    // Cleanup
    return () => {
      container.removeEventListener('mouseenter', onEnter)
      container.removeEventListener('mouseleave', onLeave)
      tween.kill()
    }
  }, [])

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-neutral-900 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-neutral-900 to-transparent" />
      <div ref={trackRef} className="flex gap-16 items-center whitespace-nowrap will-change-transform">
        {items.map((logo, idx) => {
          const key = `${logo.name}-${idx}`
          if (logo.component) {
            const Component = logo.component
            return (
              <div
                key={key}
                className="flex h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]"
                title={logo.name}
              >
                <Component />
              </div>
            )
          }
          if (logo.url) {
            return (
              <img
                key={key}
                src={logo.url}
                alt={logo.name}
                className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 opacity-95 shrink-0"
                title={logo.name}
              />
            )
          }
          return (
            <span
              key={key}
              className="shrink-0 rounded-full border border-white/15 bg-white/[0.05] px-5 py-2 text-sm font-medium text-neutral-100 uppercase tracking-[0.15em]"
            >
              {logo.text || logo.name}
            </span>
          )
        })}
      </div>
    </div>
  )
}

function BackgroundFX() {
  return (
    <div className="pointer-events-none select-none absolute inset-0 -z-10 overflow-hidden">
      {/* Animated gradient blobs */}
      <motion.div
        className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(56,189,248,0.16), rgba(56,189,248,0))' }}
        animate={{ x: [0, 30, -10, 0], y: [0, -10, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute top-1/3 -right-24 h-96 w-96 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(244,63,94,0.12), rgba(244,63,94,0))' }}
        animate={{ x: [0, -20, 10, 0], y: [0, 15, -10, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute bottom-[-6rem] left-1/3 h-80 w-80 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(168,85,247,0.12), rgba(168,85,247,0))' }}
        animate={{ x: [0, 10, -10, 0], y: [0, -10, 10, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px),' +
            'linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)'
        }}
      />
    </div>
  )
}

function DoodlesHero() {
  const wrapRef = useRef(null)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const svgs = el.querySelectorAll('svg[data-float]')
    const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
    svgs.forEach((s, i) => {
      tl.to(s, { y: i % 2 === 0 ? -6 : 8, rotate: i % 2 === 0 ? -2 : 3, duration: 3 + (i % 3) }, 0)
    })
    return () => tl.kill()
  }, [])
  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 -z-0">
      {/* Corner squiggle */}
      <svg data-float width="140" height="140" viewBox="0 0 140 140" className="absolute top-10 right-6 opacity-50">
        <path d="M10 40 C40 10, 80 70, 120 20" stroke="white" strokeOpacity="0.5" strokeWidth="2" fill="none" className="dash-anim" />
      </svg>
      {/* Side bracket */}
      <svg data-float width="120" height="120" viewBox="0 0 120 120" className="absolute bottom-24 left-4 opacity-40">
        <path d="M10 10 L10 110 M10 10 L40 10 M10 110 L40 110" stroke="white" strokeOpacity="0.4" strokeWidth="2" fill="none" className="dash-anim" />
      </svg>
      {/* Dev doodles: angle brackets */}
      <svg data-float width="90" height="90" viewBox="0 0 90 90" className="absolute top-28 left-10 opacity-40">
        <path d="M40 20 L20 45 L40 70" stroke="white" strokeOpacity="0.5" strokeWidth="2" fill="none" />
        <path d="M50 20 L70 45 L50 70" stroke="white" strokeOpacity="0.5" strokeWidth="2" fill="none" />
      </svg>
      {/* Curly brace */}
      <svg data-float width="80" height="120" viewBox="0 0 80 120" className="absolute top-8 md:top-20 left-1/2 opacity-30">
        <path d="M30 10c-10 0-10 10-10 20s-10 10-10 10 10 0 10 10 0 20 10 20" stroke="white" strokeOpacity="0.5" strokeWidth="2" fill="none" />
        <path d="M50 10c10 0 10 10 10 20s10 10 10 10-10 0-10 10 0 20-10 20" stroke="white" strokeOpacity="0.5" strokeWidth="2" fill="none" />
      </svg>
      {/* Code slash */}
      <svg data-float width="90" height="90" viewBox="0 0 90 90" className="absolute bottom-10 right-10 opacity-40 hidden sm:block">
        <path d="M30 70 L60 20" stroke="white" strokeOpacity="0.45" strokeWidth="2" />
      </svg>
    </div>
  )
}

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="8" r="4" strokeWidth="1.6" />
      <path d="M4 21a8 8 0 0 1 16 0" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function IconBriefcase() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="7" width="18" height="12" rx="2" strokeWidth="1.6" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" strokeWidth="1.6" />
      <path d="M3 12h6m6 0h6" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function IconSparkles() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}
function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="3" width="8" height="8" rx="2" strokeWidth="1.6" />
      <rect x="13" y="3" width="8" height="8" rx="2" strokeWidth="1.6" />
      <rect x="3" y="13" width="8" height="8" rx="2" strokeWidth="1.6" />
      <rect x="13" y="13" width="8" height="8" rx="2" strokeWidth="1.6" />
    </svg>
  )
}
function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="1.6" />
      <path d="M4 7l8 6 8-6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconBook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 3V7a3 3 0 0 1 3-3Z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 4h2a2 2 0 0 1 2 2v13" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M20 6 9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconQuote() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
      <path d="M7 7h4v4H8a3 3 0 0 0-3 3v3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 7h4v4h-3a3 3 0 0 0-3 3v3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CSSIcon() {
  return (
    <svg viewBox="0 0 128 128" className="h-7 w-7 sm:h-8 sm:w-8">
      <path fill="#1572B6" d="M18 0l8.2 92 37.8 10 38-10.1L110 0H18zm73 26H62l.7 7h27.6l-3 33.3-21.3 6-21.4-6-.8-13.6h10.4l.3 6.8 11.5 3 11.4-3 1.2-13.3H41.6L39 18h68.3l-2.3 26z" />
      <path fill="#33A9DC" d="M64 23H41.6l2.6 29.9H76l-1.2 13.3-10.8 3-11.4-3-.3-6.8H42l.8 13.6 21.4 6 21.3-6 3-33.3H62l-.7-7H91l2.3-26H39l2.6 29.9H64z" />
    </svg>
  )
}

function SocialDock() {
  return (
    <div className="fixed right-5 bottom-20 md:bottom-10 z-50 flex flex-col items-center gap-3">
      <a
        href="https://wa.me/918891873321"
        target="_blank"
        rel="noreferrer"
        className="transition hover:opacity-80"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon />
      </a>
      <a
        href="https://instagram.com/shahiirrrr"
        target="_blank"
        rel="noreferrer"
        className="transition hover:opacity-80"
        aria-label="Instagram"
      >
        <InstagramIcon />
      </a>
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 256 256" fill="none">
      <path
        d="M128 24c-57 0-104 45.8-104 102.2 0 18.1 4.9 35 13.5 49.7L24 232l58.3-12.6c14.3 7.7 30.6 12.1 45.7 12.1 57 0 104-45.8 104-102.2S185 24 128 24Z"
        fill="#25D366"
      />
      <path
        d="M188.5 152.9c-2.6-1.3-15.8-7.7-18.2-8.6s-4.3-1.3-6.1 1.2c-1.8 2.5-7 8.6-8.6 10.4-1.6 1.7-3.2 2-5.8.7-2.6-1.3-11-4.4-21-13.9-7.8-7.3-13.1-16.2-14.6-18.9s-.2-4.2 1.1-5.4c1.1-1.1 2.5-2.9 3.7-4.3 1.2-1.4 1.6-2.5 2.4-4.2.8-1.7.4-3.2-.2-4.4-.7-1.3-6.1-14.6-8.4-20-2.2-5.3-4.4-4.6-6.1-4.7-1.6-.1-3.5-.1-5.4-.1-2 0-5.2.7-7.9 3.2s-10.4 10.2-10.4 25c0 14.8 10.7 29.1 12.2 31s21 32.8 51.1 45c7.1 3.1 12.7 4.9 17.1 6.3 7.2 2.3 13.8 2 19 1.2 5.8-.9 15.8-6.4 18-12.6 2.2-6.2 2.2-11.5 1.5-12.6-.7-1-2.4-1.7-5-3Z"
        fill="#FFF"
      />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 256 256" fill="none">
      <path
        d="M176 24H80C52.8 24 32 44.8 32 72v96c0 27.2 20.8 48 48 48h96c27.2 0 48-20.8 48-48V72c0-27.2-20.8-48-48-48Z"
        fill="url(#instaGradient)"
      />
      <defs>
        <linearGradient id="instaGradient" x1="32" y1="24" x2="224" y2="232" gradientUnits="userSpaceOnUse">
          <stop offset="0.05" stopColor="#F58529" />
          <stop offset="0.3" stopColor="#FEDA77" />
          <stop offset="0.6" stopColor="#DD2A7B" />
          <stop offset="0.9" stopColor="#8134AF" />
          <stop offset="1" stopColor="#515BD4" />
        </linearGradient>
      </defs>
      <circle cx="128" cy="128" r="38" stroke="#FFF" strokeWidth="16" fill="none" />
      <circle cx="180" cy="76" r="12" fill="#FFF" />
    </svg>
  )
}
function IconGithub() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.71.5.09.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.2-3.37-1.2-.46-1.2-1.13-1.52-1.13-1.52-.93-.66.07-.65.07-.65 1.03.07 1.57 1.07 1.57 1.07.91 1.59 2.39 1.13 2.97.86.09-.67.36-1.13.65-1.39-2.22-.26-4.56-1.13-4.56-5.04 0-1.11.38-2.01 1.02-2.72-.1-.26-.45-1.31.1-2.72 0 0 .84-.27 2.75 1.04A9.26 9.26 0 0 1 12 7.3c.85 0 1.7.12 2.5.35 1.91-1.31 2.75-1.04 2.75-1.04.55 1.41.2 2.46.1 2.72.64.71 1.02 1.61 1.02 2.72 0 3.92-2.34 4.77-4.57 5.03.37.33.69.98.69 1.98 0 1.43-.01 2.58-.01 2.93 0 .27.18.59.69.49A10.06 10.06 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
    </svg>
  )
}

function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.02-5Zm.02 6H2V22h3V9.5ZM8 9.5h2.9V11h.04c.4-.76 1.38-1.56 2.83-1.56C17.8 9.44 19 11 19 13.7V22h-3v-7.2c0-1.72-.61-2.9-2.14-2.9-1.16 0-1.85.78-2.16 1.53-.11.26-.14.62-.14.98V22H8V9.5Z" />
    </svg>
  )
}

function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/15 text-neutral-100 transition border border-white/10"
    >
      <div className="h-5 w-5">{children}</div>
    </a>
  )
}
