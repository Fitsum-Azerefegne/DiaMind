# DiaMind 💙

**Your compassionate AI companion for emotional wellness on your diabetes journey**

DiaMind provides AI-powered emotional support, wellness tracking, and mindfulness tools specifically designed for people managing diabetes. Built with React, TypeScript, and Supabase.

## ✨ Features

### 🤖 AI Chat Companion
- Empathetic AI conversations about diabetes-related stress and emotions
- Real-time streaming responses with conversation history
- Safe space for expressing feelings and receiving support

### 📊 Wellness Tracking
- Interactive daily checklist (hydration, blood sugar, sleep, mindfulness)
- Progress tracking with encouraging feedback
- Completion rewards unlock daily diabetes facts

### 🎮 Wellness Games
- **Memory Match**: Calming card matching game
- **Breathing Exercise**: Interactive mindfulness with visual cues
- **Color Puzzle**: Relaxing pattern-based game
- Score tracking and achievement system

### 📚 Daily Diabetes Facts
- 365 unique, educational diabetes facts
- Unlocked by completing daily wellness activities
- Personal fact library with progress tracking

### 👤 Personalization
- Custom user profiles with diabetes journey details
- Personalized AI responses based on user history
- Achievement tracking and celebration

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Functions)
- **State**: React Query, Context API
- **Animations**: CSS animations, Canvas API

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/diamind.git
cd diamind
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```
Add your Supabase credentials to `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start development server**
```bash
npm run dev
```

5. **Open in browser**
Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── WellnessChecklist.tsx
│   ├── DailyFact.tsx
│   └── ...
├── pages/              # Main application pages
│   ├── Index.tsx       # Dashboard
│   ├── Chat.tsx        # AI Chat interface
│   ├── Games.tsx       # Wellness games
│   └── ...
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
└── utils/              # Utility functions
```

## 🎯 Key Components

### Dashboard (`src/pages/Index.tsx`)
- Personalized welcome message
- Wellness activity checklist
- Achievement tracking
- Daily fact unlock system

### AI Chat (`src/pages/Chat.tsx`)
- Streaming chat interface
- Conversation history
- Emotional support focus

### Wellness Games (`src/pages/Games.tsx`)
- Three interactive games
- Score tracking
- Stress relief and mindfulness

## 🔒 Privacy & Safety

- **Medical Disclaimer**: Clear boundaries about AI limitations
- **Crisis Resources**: Direct links to professional help
- **Data Security**: Supabase encryption and secure authentication
- **User Control**: Data export and deletion options

## 🎨 Design Philosophy

- **Calm & Professional**: Soft blues, whites, gentle animations
- **Accessible**: High contrast, readable fonts, keyboard navigation
- **Encouraging**: Focus on progress, not perfection
- **Uncluttered**: Clean interface prioritizing user wellness

## 🚀 Deployment

### Build for production
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💙 Support

DiaMind is built with love for the diabetes community. If you need support:

- 🐛 **Bug Reports**: Open an issue on GitHub
- 💡 **Feature Requests**: Start a discussion
- 🆘 **Crisis Support**: Contact emergency services or crisis helplines

---

**Remember**: DiaMind provides emotional support but is not a substitute for professional medical or mental health care. Always consult healthcare providers for medical decisions.

Made with 💙 for the diabetes community
