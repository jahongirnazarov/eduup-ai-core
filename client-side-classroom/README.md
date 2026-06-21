# EduUp Zero-Cost Interactive Classroom

A revolutionary 100% client-side interactive classroom and exam simulation system designed for 100M users, running entirely on Web technologies with $0 hosting costs on Cloudflare Pages.

## 🚀 Features

### Architecture & Edge Computing
- **100% Static Hosting**: Deployed on Cloudflare Pages with zero server costs
- **Local AI Processing**: WebLLM + WebGPU runs entirely in the browser
- **Native Speech Synthesis**: Web Speech API with localized voices
- **GPU-Accelerated Rendering**: WebGL + Three.js for all graphics

### Interactive Classroom
- **Photorealistic 2D Avatar "Malika"**: WebGL mesh deformation with PixiJS/Spine
- **Real-time Lip-Sync**: Phoneme-based mouth deformation synchronized with TTS
- **Chalk Writing Simulation**: Progressive text drawing with mathematical symbols
- **Interactive 3D Models**: Three.js geometric shapes with orbit controls

### Exam Simulations
- **Digital SAT (Bluebook Clone)**: Desmos calculator, highlighter, strikethrough, timer
- **IELTS Academic**: Reading, Listening, Speaking modules with AI speech analysis

## 🛠️ Tech Stack

- **Build Tool**: Vite + TypeScript
- **2D Graphics**: PixiJS + Spine-TS
- **3D Graphics**: Three.js
- **AI/ML**: WebLLM (@mlc-ai/web-llm)
- **Speech**: Web Speech API + Web Audio API
- **Styling**: Tailwind CSS
- **Hosting**: Cloudflare Pages

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd client-side-classroom

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment to Cloudflare Pages

### Option 1: Direct Upload

1. Build the project:
```bash
npm run build
```

2. Upload the `dist/` folder to Cloudflare Pages

### Option 2: Git Integration

1. Push to GitHub/GitLab
2. Connect repository to Cloudflare Pages
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy

### Option 3: Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy dist
```

## 🎯 Usage

### Classroom Mode

1. Click "Start Lesson" to begin AI-powered teaching
2. Malika will explain concepts with synchronized speech and chalk writing
3. Use "Toggle 3D" to show interactive geometric models
4. Orbit, rotate, and zoom 3D objects with mouse/touch

### SAT Exam Mode

1. Click "SAT Exam" in navigation
2. Use built-in Desmos calculator for math problems
3. Highlight text, strike through options, mark for review
4. Timer counts down automatically

### IELTS Exam Mode

1. Click "IELTS Exam" in navigation
2. **Reading**: Split-screen with passage and questions
3. **Listening**: Audio plays once with prep-time countdown
4. **Speaking**: Record answers with AI speech analysis

## 🔧 Configuration

### WebLLM Model Selection

Edit `src/ai/webllm-engine.ts` to change the AI model:

```typescript
const selectedModel = 'Llama-3-8B-Instruct-q4f16_1-MLC'
```

Available models:
- Llama-3-8B-Instruct-q4f16_1-MLC (default)
- Phi-3-mini-4k-instruct-q4f16_1-MLC
- Gemma-2-2b-it-q4f16_1-MLC

### TTS Voice Selection

Edit `src/audio/tts-engine.ts` to customize voices:

```typescript
private LANGUAGE_VOICES: Record<string, string> = {
    'uz': 'Microsoft Madina',
    'en': 'Microsoft Aria',
    // Add more languages
}
```

## 📁 Project Structure

```
client-side-classroom/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── index.html              # Main HTML
│   ├── core/
│   │   └── router.ts           # Navigation router
│   ├── ai/
│   │   └── webllm-engine.ts    # Local AI processing
│   ├── avatar/
│   │   └── avatar-system.ts    # 2D avatar with WebGL
│   ├── audio/
│   │   └── tts-engine.ts       # Text-to-speech
│   ├── classroom/
│   │   ├── classroom-manager.ts
│   │   └── chalk-writer.ts     # Chalk writing simulation
│   ├── 3d/
│   │   └── three-scene.ts      # 3D geometric canvas
│   └── exams/
│       ├── sat/
│       │   └── sat-exam.ts     # Digital SAT simulation
│       └── ielts/
│           └── ielts-exam.ts   # IELTS simulation
├── public/                     # Static assets
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## 🎨 Customization

### Avatar Assets

Replace the placeholder avatar in `src/avatar/avatar-system.ts` with your photorealistic 2D teacher image and Spine skeleton data.

### Color Themes

Edit `tailwind.config.js` to customize colors:

```javascript
theme: {
    extend: {
        colors: {
            chalkboard: {
                dark: '#1a3a1a',
                medium: '#2d5a2d',
                light: '#3d7a3d'
            }
        }
    }
}
```

## 🔒 Security

- No server-side processing
- All data stays in the browser
- No API keys or external dependencies
- CSP headers configured in `_headers`

## 📊 Performance

- **Initial Load**: ~2MB (includes WebLLM WASM)
- **Subsequent Loads**: <100KB (cached assets)
- **Runtime Memory**: ~500MB (WebLLM model)
- **GPU Requirements**: WebGL 2.0 compatible

## 🌍 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 15+
- Edge 90+

Required features:
- WebGL 2.0
- WebGPU (optional, for AI acceleration)
- Web Speech API
- Web Audio API

## 🤝 Contributing

This is a zero-cost educational platform. Contributions welcome!

## 📄 License

MIT License - Free for educational use

## 🙏 Acknowledgments

- WebLLM by MLC AI
- Three.js
- PixiJS
- Desmos Graphing Calculator
- Cloudflare Pages

## 📞 Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ for global education accessibility**
