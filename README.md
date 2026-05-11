# FitLife AI - Personal Fitness & Nutrition Assistant

A modern, AI-powered fitness and nutrition web application built with React, Firebase, and Gemini AI. Get personalized workout plans, nutrition guidance, and track your progress with intelligent recommendations.

## Features

### Authentication & User Management
- **Firebase Authentication**: Secure email/password authentication
- **Profile Setup**: Multi-step onboarding to collect user fitness data
- **User Profiles**: Store and manage age, height, weight, gender, activity level, and fitness goals

### Dashboard & Metrics
- **BMI Calculator**: Real-time Body Mass Index calculation with category
- **BMR Calculator**: Basal Metabolic Rate based on user metrics
- **TDEE Calculator**: Total Daily Energy Expenditure based on activity level
- **Calorie Goals**: Personalized daily calorie targets based on fitness goals

### AI-Powered Recommendations
- **Workout Plans**: Gemini AI generates personalized weekly workout plans
  - Customized based on age, weight, fitness goals, and activity level
  - Cold-start defaults for immediate recommendations
  - Exercise cards with sets, reps, and descriptions
  - Categorized by type (strength, cardio, core) with distinct styling

- **Nutrition Plans**: AI-generated daily meal plans
  - Balanced macronutrient distribution
  - Meal timing recommendations
  - Calorie breakdown per meal
  - Protein, carbs, and fats tracking

### Progress Tracking
- **Interactive Charts**: Visualize your fitness journey
  - Weight tracking over time
  - Workout frequency analytics
  - Calorie consumption trends
  - Switchable views (weekly/monthly)

- **Fitness Planner**: Log and track daily activities
  - Workout logging with notes
  - Meal tracking with calorie counts
  - Weight progress logging
  - Calendar-based organization

### Design & UX
- **Responsive Design**: Optimized for all devices (mobile, tablet, desktop)
- **Smooth Animations**:
  - Page transitions
  - Card hover effects
  - Loading states
  - Micro-interactions
- **Modern UI**: Clean, professional design with gradient accents
- **Accessible Navigation**: Intuitive navbar with mobile menu

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS with custom animations
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **AI Integration**: Google Gemini AI API
- **Charts**: Recharts library
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Application Structure

```
src/
├── components/
│   ├── Auth/           # Login, Signup, ProfileSetup
│   ├── Dashboard/      # Main dashboard
│   ├── Workout/        # Workout cards and sections
│   ├── Diet/           # Diet cards and sections
│   ├── Charts/         # Progress tracking charts
│   ├── Planner/        # Activity logging and planning
│   └── Navigation/     # Navbar component
├── contexts/
│   └── AuthContext.tsx # Authentication state management
├── services/
│   ├── firestoreService.ts  # Database operations
│   └── geminiService.ts     # AI plan generation
├── config/
│   └── firebase.ts     # Firebase configuration
└── utils/
    └── calculations.ts # BMI, BMR, TDEE calculations
```

## Key Features Explained

### Hybrid Rule-Based + AI Approach
The application uses a smart hybrid system:
- **AI Generation**: Attempts to generate personalized plans using Gemini AI
- **Fallback Defaults**: If AI is unavailable, uses rule-based defaults
- **Cold Start**: Immediate recommendations on first login

### Firestore Data Structure
- **users**: User profiles with fitness metrics
- **workoutLogs**: Daily workout tracking
- **dietLogs**: Meal and calorie logs
- **progress**: Weight tracking entries

### Animations & Transitions
- Fade-in animations on card entries
- Hover scale effects on interactive elements
- Shake animations for error states
- Smooth page transitions
- Loading spinners for async operations

## User Flow

1. **Sign Up**: Create account with email/password
2. **Profile Setup**: Enter fitness data in 3-step wizard
3. **Dashboard**: View metrics and AI-generated plans
4. **Explore Plans**: Review personalized workout and diet recommendations
5. **Track Progress**: Log workouts, meals, and weight in Planner
6. **Monitor Trends**: Analyze progress with interactive charts

## Security & Best Practices

- Firebase security rules for data access control
- Protected routes requiring authentication
- Input validation on all forms
- Error handling with user feedback
- Responsive error states
- Loading indicators for async operations

## Performance Optimizations

- Code splitting with dynamic imports
- Lazy loading of components
- Optimized chart rendering
- Efficient Firebase queries with indexing
- Memoized calculations

## Future Enhancements

- Social features (share progress, challenges)
- Exercise video library
- Meal photo uploads
- Apple Health / Google Fit integration
- Premium AI features
- Workout reminders and notifications
- Community forums

## License

MIT License
"# Fitness_app" 
