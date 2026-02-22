⚡ CampusGig
The Hyper-Local Marketplace for VNRVJIET Students (Built in Webathon 4.0 by ACM VNRVJIET).

CampusGig is a real-time, cross-platform gig economy app designed to connect students who need quick tasks done with peers looking to earn extra rewards. From grabbing a printout at SAC to finding a coding tutor, CampusGig makes campus life more efficient.

🚀 Vision
"We didn't just build a mobile app; we built a unified cross-platform ecosystem. By utilizing React Native Web and Supabase, our codebase simultaneously compiles to Android, iOS, and the Web, ensuring every student at VNRVJIET can access the marketplace regardless of what device they own."

🛠️ Tech Stack
Frontend: React Native (Expo) & NativeWind (Tailwind CSS)

Web Support: React Native Web

Backend: Supabase (PostgreSQL, Auth, Real-time)

Deployment: EAS (Android APK) & Netlify (Web Version)

Iconography: Lucide-React-Native

✨ Key Features

1-Step vs. 2-Step Approval
We designed the task claiming process to be flexible depending on how much "trust" the poster needs.

1-Step (Instant Claim): Ideal for simple, low-stakes tasks (e.g., "Bring me a water bottle"). The first student to click "Claim" gets the gig immediately. This is built for maximum speed and efficiency.

2-Step (Application & Approval): Designed for skilled or sensitive tasks (e.g., "Fix my laptop" or "Tutor me in Java"). Multiple students can "Apply," and the task creator reviews their profiles before manually "Approving" the best fit. This ensures quality and safety.

Online vs. On-Campus Gigs
The app categorizes tasks to match student lifestyles.

On-Campus (Location-Based): These tasks utilize the Interactive Map and focus on physical presence. They include things like food delivery to a specific block or help moving equipment across the VNRVJIET campus.

Online (Remote Skills): These are skill-based tasks that can be done from a hostel room or library, such as debugging code, designing a poster, or translating a document. They appear in a dedicated Grid View on the dashboard.

⚡ Performance & Logic
Instant vs. Feasible
Instant (The "Available Now" Feed): Powered by Supabase Real-time, this feed is for "Urgent" tasks that need to be finished in the next 1–2 hours. The UI uses a pulsing animation to indicate live activity, making it the most dynamic part of the app.

Feasible (Scheduled Tasks): For tasks that aren't time-sensitive, students can browse the general list to find work that fits into their schedule later in the day or week.

📦 Installation & Usage
Mobile (Android)
Download the APK from our latest [https://expo.dev/accounts/sknayaz55/projects/web/builds/805a4b0f-efe6-4fb8-86ce-6c78e9622103].

Allow "Install from Unknown Sources" on your device.

Launch CampusGig and log in with your student credentials.

Web
Visit our live demo at: [https://campus-gig-webathon.netlify.app/]


Development
To run this project locally:

Bash
git clone https://github.com/sk-nayaz/Campus-gig-app.git
cd Campus-gig-app
npm install
npx expo start

👥 Team Contribution
Name,Role,Core Contributions
Nayaz (You),Lead Developer,"Full-stack architecture, Supabase integration, EAS Android builds, and React Native Web deployment."
Teammate Name,UI/UX & Frontend,"Figma design, NativeWind styling, and implementing the Dashboard & Profile screens."
Teammate Name,Backend & Logic,"SQL schema design, Row Level Security (RLS) rules, and real-time task status logic."
Teammate Name,Quality & Testing,"Bug fixing, dependency management, and documentation."
