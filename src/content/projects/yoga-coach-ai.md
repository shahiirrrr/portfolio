---
title: Yoga Coaching System
order: 4
stack: [Python, Computer Vision, MediaPipe]
year: 2023
thumbnail: ../../assets/images/projects/yoga-platform.jpg
card:
  order: 4
  category: [Computer Vision, Health]
  stack: [Python, MediaPipe, Android]
  image: ../../assets/images/projects/yoga-coach-ai-card.png
caseStudy:
  index: 4
  subtitle: An online yoga coaching platform linking an admin, trainers and learners — Flask web panels, a Java Android app and camera-based AI pose correction.
  role: Trainee · Regional Technologies
  timeline: 2022 — 2023
  overview:
    heading: A yoga class that checks your form.
    body: Yoga Coaching System connects three kinds of people — an admin who runs the platform, trainers who teach, and users who learn yoga from their phone. I built the Python Flask web app with its MySQL database, the admin and trainer panels and the backend the Android app talks to; the Java Android app users install; and an AI feature that uses the camera to check whether a pose is done correctly.
  stats:
    - value: '03'
      label: Roles — admin, trainer, user
    - value: '33'
      label: Body points tracked by MediaPipe
    - value: '03'
      label: Poses recognised — Tree, T, Warrior II
    - value: Java
      label: Android app on a Flask backend
  cover:
    src: ../../assets/images/projects/yoga-cover.jpg
    srcMobile: ../../assets/images/projects/yoga-cover-mobile.jpg
    alt: Illustration of live pose correction — a webcam screen shows a Warrior II attempt marked Unknown Pose, with a red front knee at 158° and a checklist of joint angles
  showcase:
    heading: Three roles and an AI coach.
    items:
      - title: Web Panels & Android App
        body: Admins add and manage trainers, assign and track work, block or unblock users and reply to complaints. Trainers upload videos, accept users' requests and answer their doubts. Users sign up on Android with their health details, then pick a trainer, watch videos and ask doubts.
        tags: [Flask, MySQL, Java Android]
        link:
          label: View the Android app repo
          url: https://github.com/shahiirrrr/yoga-coaching-system-android
        image: ../../assets/images/projects/yoga-platform.jpg
        alt: Yoga Coaching System admin web panel on a laptop beside Android screens — login, a user's practice home and the trainer list with request buttons
      - title: AI Pose Correction
        body: The camera feed runs through Google's MediaPipe, which finds 33 points on the body. The pose module measures the angles at the elbows, shoulders and knees; when they fall within set ranges it names the pose — Tree Pose, T Pose or Warrior II — in green, and anything else shows Unknown Pose in red.
        tags: [MediaPipe, OpenCV, NumPy]
        link:
          label: View the web & pose module repo
          url: https://github.com/shahiirrrr/yoga-coaching-system-web
        image: ../../assets/images/projects/yoga-pose-correction.jpg
        alt: Pose correction screen on a desktop monitor — a woman in Tree Pose with a body-landmark skeleton overlay, joint angles and the detected pose highlighted
---
