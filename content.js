/* =====================================================================
   EDIT THIS FILE TO CHANGE THE WEBSITE'S TEXT.
   You never need to touch the other files for words, links or images.

   - Anything in [SQUARE BRACKETS] is a placeholder for you to replace.
     Until you do, the site shows "Coming soon..." in its place.
   - Each item in a "body" list is one paragraph.
   - Keep the quotes and commas. If the site goes blank after an edit,
     you probably deleted one.
   ===================================================================== */

window.CONTENT = {

  /* ---------- YOU ---------- */
  name: "Ethan Luong",
  tagline: "Computer Engineering @ University of Guelph",
  major: "Computer Engineering",

  // Paste full links, e.g. "https://www.linkedin.com/in/yourname".
  // The LinkedIn and GitHub buttons stay hidden until these are filled in.
  linkedin: "https://ca.linkedin.com/in/ethan-luong-063901402",
  github: "https://github.com/ffischyy",


  /* ---------- HOLO CARDS: inside the folder ----------
     name:  the title on the card
     moves: the two short lines on the card, as ["Title", "Text"]
     open:  what clicking it opens (leave this and "art" and "tab" alone)     */
  cards: [
    {
      name: "Skills", art: "skills", open: "skills",
      moves: [["Languages", "Python, C++, C#, Java, JavaScript"], ["Design", "AutoCAD, Blender, 3D printing"]]
    },
    {
      name: "Gojo Powers", art: "gojo", open: "projects", tab: 0,
      moves: [["Hollow Purple", "Steer it with your bare hands"], ["1M particles", "A GPU simulation in real time"]]
    },
    {
      name: "Capybara Typer", art: "capybara", open: "projects", tab: 1,
      moves: [["Typing test", "WPM and accuracy on its belly"], ["All in one", "Game, electronics and printed body"]]
    },
    {
      name: "Face and Hand Tracker", art: "tracker", open: "projects", tab: 2,
      moves: [["Recognize", "Knows people by name"], ["Gestures", "Dozens, and you can teach it more"]]
    },
    {
      name: "MathDraw", art: "math", open: "projects", tab: 3,
      moves: [["Air draw", "Draw a curve with your finger"], ["Solve", "Finds its equation and calculus"]]
    },
    {
      name: "Lodestar", art: "lodestar", open: "projects", tab: 4,
      moves: [["Forecast", "Machine learning on market data"], ["Paper trade", "Virtual money only, not advice"]]
    }
  ],


  /* ---------- PC COMPONENTS: click the PC, then click a part ---------- */
  parts: {
    cpu: {
      label: "CPU", title: "About me",
      body: [
        "I'm Ethan, and I like building things that do something when you turn them on. Software, hardware, or both at once.",
        "I'm heading to the University of Guelph for Computer Engineering. Outside of class you'll find me designing robots, building PCs, or on a volleyball court.",
        "[Add a sentence about what drives you.]"
      ]
    },
    gpu: {
      label: "GPU", title: "What I create",
      body: [
        "This is my visual side. I like making real-time graphics that react to you, like a million-particle GPU simulation you steer with your hands through a webcam.",
        "I model in Blender and AutoCAD, so what I design on screen can also become something printed and held.",
        "[Add what you most want to make next.]"
      ]
    },
    ram: {
      label: "RAM", title: "What I'm learning right now",
      body: [
        "[List what you're working on learning at the moment: a language, a tool, a course, a new kind of project.]",
        "[What's the next thing you're curious about?]"
      ]
    },
    motherboard: {
      label: "Motherboard", title: "My foundation",
      body: [
        "Everything connects here. I'm starting Computer Engineering at the University of Guelph, where I want to go deeper on the place hardware and software meet.",
        "[Add your goals: the kind of engineer you want to be, or the field you'd like to work in.]"
      ]
    },
    ssd: {
      label: "Storage", title: "Experience and achievements",
      body: [
        "[Add jobs, teams, awards, competitions and anything else you want saved permanently here.]",
        "Biggest projects so far: Lodestar, a machine-learning stock research terminal, and Capybara Typer, a typing game inside a 3D-printed capybara that I designed from the code to the enclosure."
      ]
    },
    psu: {
      label: "Power supply", title: "What powers me",
      body: [
        "Volleyball is how I recharge. [Say what the sport gives you.]",
        "[Add your other hobbies and whatever keeps you motivated.]"
      ]
    },
    fans: {
      label: "Cooling fans", title: "Fun facts",
      body: [
        "[Fun fact one.]",
        "[Fun fact two.]",
        "I designed a typing game that lives inside a capybara."
      ]
    }
  },


  /* ---------- PROJECTS: each one opens from its own card ----------
     image: a file in the assets folder, e.g. "assets/lodestar.png" ("" leaves the picture out)
     link:  the GitHub link for this project ("" hides the button)            */
  projects: [
    {
      tab: "Gojo Powers",
      title: "Gojo Powers (Limitless)",
      tech: ["Python", "MediaPipe", "ModernGL", "PySide6", "NumPy"],
      body: [
        "Control Hollow Blue, Hollow Red, Hollow Purple and Domain Expansion: Unlimited Void with your hands through an ordinary webcam.",
        "Live tracking of 21 landmarks per hand drives a GPU particle simulation of 65,000 to 1 million particles, plus volumetric energy spheres, lightning, shockwaves and gravitational lensing of the camera image. It runs entirely on your own machine, in six languages.",
        "All visuals and sounds are original and procedurally generated. It's a fan project inspired by Jujutsu Kaisen."
      ],
      image: "assets/gojo.jpg",
      alt: "Purple energy sphere held between two hands in the Gojo Powers app",
      caption: "Rendered with the app's built-in simulated hands.",
      link: ""
    },
    {
      tab: "Capybara Typer",
      title: "Capybara Typer",
      tech: ["Arduino UNO Q", "Python", "C++", "AutoCAD", "Blender", "3D printing"],
      body: [
        "A standalone typing-speed game designed to live inside a 3D-printed capybara. You type on a USB keyboard while a touchscreen in its belly shows the passage, timer, WPM and accuracy, with no computer needed.",
        "I designed all of it: the game software, the electronics and wiring, and the printed body, screen mount and base, including structural and stability calculations."
      ],
      image: "assets/capybara.jpg",
      alt: "CAD render of the Capybara Typer, a rounded capybara with a screen in its belly",
      caption: "CAD render.",
      link: ""
    },
    {
      tab: "Face & Hand Tracker",
      title: "Face and Hand Tracker",
      tech: ["Python", "OpenCV", "MediaPipe", "NumPy"],
      body: [
        "A webcam app that recognizes people by name and tracks both hands in real time.",
        "It understands dozens of one-hand, two-hand and movement gestures, and you can teach it your own. Making a camera-frame shape with your hands takes a photo and enrolls the person in it, and everything from themes to on-screen elements is customizable."
      ],
      image: "",
      alt: "",
      caption: "",
      link: ""
    },
    {
      tab: "MathDraw",
      title: "MathDraw",
      tech: ["Python", "MediaPipe", "SymPy", "SciPy", "PySide6"],
      body: [
        "Draw a curve in the air with your finger and get its equation.",
        "MathDraw tracks your hand, uses symbolic regression to discover a function matching your stroke, then reports its calculus properties: derivative, antiderivative, integrals, limits and series."
      ],
      image: "",
      alt: "",
      caption: "",
      link: ""
    },
    {
      tab: "Lodestar",
      title: "Lodestar",
      tech: ["Python", "FastAPI", "scikit-learn", "pandas", "React", "TypeScript"],
      body: [
        "A local stock-market research terminal with machine-learning forecasts, an opportunity scanner, backtesting and paper trading.",
        "It compares several prediction methods using walk-forward validation, and an AI autopilot can trade under user-set risk limits with every decision logged.",
        "Lodestar uses virtual money only and isn't financial advice."
      ],
      image: "",
      alt: "",
      caption: "",
      link: ""
    }
  ],


  /* ---------- SKILLS: click the Skills card ----------
     Add or remove anything. A new { group, items } block becomes a new module. */
  skills: [
    { group: "Languages", items: ["Python", "C++", "C#", "Java", "JavaScript", "TypeScript", "HTML/CSS", "SQL"] },
    { group: "Design and 3D", items: ["AutoCAD", "Blender", "3D printing", "Mechanical design"] },
    { group: "Hardware", items: ["Arduino", "Electronics and wiring", "Robotics design and building", "PC building"] },
    { group: "AI and data", items: ["Machine learning", "scikit-learn", "Computer vision", "OpenCV", "MediaPipe", "NumPy", "pandas"] },
    { group: "Software", items: ["React", "FastAPI", "PySide6", "OpenGL", "Git/GitHub"] }
  ],


  /* ---------- EXTRA SECTIONS: shown in the plain list if the 3D can't load ---------- */
  hobbies: {
    volleyball: {
      label: "Volleyball", title: "Volleyball",
      body: [
        "I play [YOUR POSITION] for [YOUR TEAM OR LEAGUE].",
        "[Say what you love about the sport: the team, the rallies, a favourite moment.]"
      ]
    },
    robot: {
      label: "Robotics", title: "Robotics",
      body: [
        "I design and build robots, from the CAD model through the wiring to the code that moves them.",
        "[Describe a robot you've built: what it did, what you learned, what went wrong.]"
      ]
    },
    grad: {
      label: "University of Guelph", title: "University of Guelph",
      body: [
        "Next stop: Computer Engineering at the University of Guelph.",
        "[Add why you chose Guelph, your start year, and what you want to get out of the program.]"
      ]
    }
  }
};
