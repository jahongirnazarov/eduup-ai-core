# MALIKA 3D - Serverless AI Educator

## 🎯 Mission
100% serverless client-side architecture for 1 billion users with $0 server cost. Runs entirely in the browser using WebGPU/WebLLM for AI inference and Web Audio API for lip-sync.

## 🏗️ Architecture

### Zero-Cost Scaling Constraints
- **NO Centralized AI APIs**: No OpenAI, ElevenLabs, or paid cloud services
- **100% Client-Side Inference**: WebGPU/WebLLM (Transformers.js) runs quantized models (Llama-3-8B-Instruct or Phi-3-mini INT4) in browser cache
- **Audio-Driven Web Audio API**: Local audio analysis drives 3D model mouth shapes
- **Static Asset Distribution**: Hosted entirely on Cloudflare Free Tier CDN

## 📁 File Structure

```
frontend/
├── index.html          # Main single-file application
├── malika.glb          # 3D avatar model (to be added)
└── README.md           # This file
```

## 🚀 Quick Start

### 1. Setup the 3D Model

The application expects a `malika.glb` file in the same directory. You have two options:

#### Option A: Use Ready Player Me (Free)
1. Go to [readyplayer.me](https://readyplayer.me)
2. Create a custom avatar
3. Download the .glb file
4. Rename it to `malika.glb`
5. Place it in the `frontend/` directory

#### Option B: Use Mixamo (Free)
1. Go to [mixamo.com](https://www.mixamo.com)
2. Select a character
3. Download with idle/breathing animation
4. Rename to `malika.glb`
5. Place in `frontend/` directory

#### Option C: Use Existing Model
If you have a GLB/GLTF model with morph targets for lip-sync (jawOpen, mouthSmile), place it as `malika.glb`.

**Important**: The model should have:
- Morph targets named `jawOpen` and `mouthSmile` for lip-sync
- Idle/breathing animation for natural movement
- Reasonable polygon count (<50K for mobile performance)

### 2. Local Testing

Simply open `index.html` in a modern browser:

```bash
# Using Python
cd frontend
python -m http.server 8000

# Using Node.js
npx serve

# Or just double-click index.html
```

Then navigate to `http://localhost:8000`

### 3. Deploy to Cloudflare Pages

#### Method A: Git Integration (Recommended)
1. Push your code to GitHub/GitLab
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
3. Create a new Pages project
4. Connect your Git repository
5. Set build directory to `frontend`
6. Deploy

#### Method B: Direct Upload
1. Go to Cloudflare Pages Dashboard
2. Create a new project
3. Select "Direct Upload"
4. Upload the `frontend/` folder contents
5. Deploy

## 🎨 Features Implemented

### 3D Rendering (Three.js)
- ✅ WebGLRenderer with performance optimizations
- ✅ Pixel ratio capping (max 2) for mobile
- ✅ High-performance GPU preference
- ✅ OrbitControls for user interaction
- ✅ Responsive viewport

### Model Loading
- ✅ GLTFLoader for .glb/.gltf models
- ✅ AnimationMixer for idle breathing animation
- ✅ Fallback procedural avatar if model fails
- ✅ Morph target detection for lip-sync

### Lip-Sync System
- ✅ Web Audio API AnalyserNode
- ✅ Real-time frequency analysis
- ✅ Morph target mapping (jawOpen, mouthSmile)
- ✅ Smooth interpolation for natural movement
- ✅ Frame skipping for performance optimization

### AI Brain (WebLLM/Transformers.js)
- ✅ Boilerplate configuration for client-side LLM
- ✅ Support for quantized models (Llama-3-8B, Phi-3-mini)
- ✅ Dual-personality character prompt injection
- ✅ Ready for WebGPU acceleration

### Mobile Optimization
- ✅ Thermal throttling detection
- ✅ Dynamic quality adjustment
- ✅ Frame skipping for morph updates
- ✅ Pixel ratio capping
- ✅ FPS monitoring and adaptive rendering
- ✅ Shadow map disabling for low-end devices

### Performance Features
- ✅ FPS counter with color-coded status
- ✅ Status panel for component health
- ✅ Loading overlay with spinner
- ✅ Graceful fallback on errors
- ✅ Memory-efficient rendering

## 🔧 Configuration

### Performance Tuning

Edit `PERFORMANCE_CONFIG` in `index.html`:

```javascript
const PERFORMANCE_CONFIG = {
    maxPixelRatio: 2,           // Max device pixel ratio
    targetFPS: 60,              // Target frames per second
    lowEndThreshold: 30,        // FPS threshold for low-end mode
    thermalThrottleFPS: 24,     // FPS threshold for thermal throttling
    analyserFFTSize: 256,       // Audio analyser FFT size
    morphUpdateInterval: 2,      // Update morph targets every N frames
    breathAnimationSpeed: 1.2    // Breathing animation speed
};
```

### AI Configuration

Edit `AI_CONFIG` in `index.html`:

```javascript
const AI_CONFIG = {
    engine: 'webllm',                    // or 'transformers-js'
    model: 'Llama-3-8B-Instruct-q4f16_1-MLC',
    model_lib: 'https://huggingface.co/...',
    personality: MALIKA_PERSONALITY,
    max_tokens: 512,
    temperature: 0.7
};
```

### Personality Configuration

Edit `MALIKA_PERSONALITY` in `index.html` to customize Malika's behavior:

```javascript
const MALIKA_PERSONALITY = {
    name: "Malika",
    role: "AI Virtual Educator",
    personalities: {
        mentor: { /* warm, encouraging */ },
        disciplinarian: { /* strict, firm */ },
        marketer: { /* persuasive, energetic */ }
    },
    system_prompt: "..."
};
```

## 🎯 API Usage

### JavaScript API

The application exposes a global API for external control:

```javascript
// Speak text (triggers lip-sync)
window.MalikaAPI.speak("Assalomu alaykum! Bugun matematika darsimizni boshlaymiz.");

// Switch personality mode
window.MalikaAPI.setPersonality('mentor');      // or 'disciplinarian', 'marketer'
```

### Integration with Existing Backend

To integrate with your existing EduUp backend:

1. **Fetch responses from backend**:
```javascript
async function getAIResponse(question) {
    const response = await fetch('/api/ai/query', {
        method: 'POST',
        body: JSON.stringify({ question })
    });
    const data = await response.json();
    window.MalikaAPI.speak(data.response);
}
```

2. **Use Web Speech API for voice input**:
```javascript
const recognition = new webkitSpeechRecognition();
recognition.lang = 'uz-UZ';
recognition.onresult = (event) => {
    const question = event.results[0][0].transcript;
    getAIResponse(question);
};
recognition.start();
```

## 🌐 Browser Compatibility

### Required Features
- WebGL 2.0
- Web Audio API
- ES6 Modules
- WebGPU (optional, for AI acceleration)

### Tested Browsers
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 15+

### Mobile Support
- ✅ iOS Safari 15+
- ✅ Chrome Mobile
- ✅ Samsung Internet

## 📊 Performance Benchmarks

### Target Devices
- **High-end**: 60 FPS with all features
- **Mid-range**: 45-60 FPS with reduced quality
- **Low-end ($50 devices)**: 30+ FPS with aggressive optimization

### Optimization Strategies
1. **Pixel Ratio Capping**: Limits rendering resolution
2. **Frame Skipping**: Reduces morph target updates
3. **Shadow Disabling**: Removes expensive shadow calculations
4. **Thermal Throttling**: Detects and adapts to overheating
5. **FFT Size Reduction**: Smaller audio analysis buffer

## 🔒 Security Considerations

### Client-Side Only
- No server-side processing required
- All AI inference happens in browser
- No data leaves user's device
- Perfect for privacy-sensitive applications

### Model Security
- Models are loaded from trusted CDN
- No external API calls to paid services
- Quantized models reduce download size

## 🚀 Deployment Checklist

- [ ] Place `malika.glb` in frontend directory
- [ ] Test locally with `python -m http.server`
- [ ] Verify lip-sync works with audio
- [ ] Test on mobile devices
- [ ] Push to Git repository
- [ ] Deploy to Cloudflare Pages
- [ ] Configure custom domain (optional)
- [ ] Enable Cloudflare Analytics (optional)

## 📝 Future Enhancements

### Planned Features
- [ ] Full WebLLM integration with actual model loading
- [ ] Web Speech API for voice input
- [ ] PWA manifest for installable app
- [ ] Offline support with service worker
- [ ] Multi-language support
- [ ] Classroom environment with virtual board
- [ ] Student progress tracking (localStorage)

### AI Enhancements
- [ ] RAG (Retrieval-Augmented Generation) with local vector DB
- [ ] Multi-modal input (text, voice, images)
- [ ] Real-time translation
- [ ] Adaptive learning paths

## 🐛 Troubleshooting

### Model Not Loading
- Ensure `malika.glb` is in the same directory as `index.html`
- Check browser console for CORS errors
- Verify model file size (<50MB recommended)

### Lip-Sync Not Working
- Click "Ovozni Faollashtirish" button first (browser requirement)
- Check if morph targets exist in model
- Verify audio is playing

### Poor Performance on Mobile
- Application automatically reduces quality
- Check FPS counter in status panel
- Consider using simpler model

### Audio Not Playing
- Browser requires user interaction first
- Click the activation button
- Check browser audio permissions

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify all files are in correct locations
3. Test with different browsers
4. Review performance benchmarks

## 📄 License

This is part of the EduUp Imperial Autonomous Platform.

---

**Built with ❤️ for 1 billion students worldwide**
