# English-Arabic Flashcards & Quiz App

A comprehensive Progressive Web App (PWA) for learning English-Arabic vocabulary with interactive flashcards and multiple practice modes, now featuring AI-powered image extraction using Google's Gemini API.

## 🌟 Features

### 📚 Core Features
- **Interactive Flashcards**: Flip cards to see English words and Arabic translations
- **Multiple Practice Modes**:
  - ✍️ Typing Quiz
  - 🎯 Multiple Choice
  - 📝 Fill in the Blank
  - 🔀 Word Scramble
  - 🎧 Listening Practice
- **Statistics Tracking**: Monitor your progress and study streaks
- **Dark/Light Theme**: Toggle between themes for comfortable studying
- **Audio Pronunciation**: Listen to English words using text-to-speech
- **Export/Import**: Save and load your flashcards as JSON files

### 🤖 NEW: AI-Powered Image Extraction
- **📸 Upload Images**: Drag & drop or click to upload images containing English-Arabic word pairs
- **🔍 AI Extraction**: Uses Google's Gemini Vision API to automatically extract words from images
- **📝 Smart Parsing**: Converts extracted text into structured flashcards with examples
- **✅ Selective Addition**: Choose which extracted words to add to your collection
- **🔑 API Integration**: Secure API key management with local storage

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Gemini API key (for image extraction feature)

### Installation

1. **Clone or Download** the project files
2. **Open** `index.html` in your web browser
3. **Install as PWA** (optional): Click the install prompt for a native app experience

### Setting Up Gemini API (for Image Extraction)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Enter your API key in the app's "Gemini API Key" field
4. The key will be saved locally for future use

## 📖 How to Use

### Adding Flashcards Manually
1. Fill in the English word, Arabic meaning, and example sentence
2. Click "Add Flashcard"

### Extracting Words from Images
1. **Upload Image**: Click the upload area or drag & drop an image
2. **Enter API Key**: Provide your Gemini API key
3. **Extract Words**: Click "Extract Words" to process the image
4. **Review Results**: Check the extracted words and examples
5. **Add Selected**: Choose which words to add to your flashcards

### Studying with Flashcards
- **Browse**: Use arrow buttons to navigate through cards
- **Flip**: Click on cards to see translations and examples
- **Shuffle**: Enable shuffle mode for random card order
- **Practice**: Use different quiz modes to test your knowledge

### Practice Modes
- **Typing Quiz**: Type the English word for Arabic meanings
- **Multiple Choice**: Choose from 4 options
- **Fill in Blank**: Complete sentences with missing words
- **Word Scramble**: Unscramble letters to form words
- **Listening**: Listen and type what you hear

## 🛠️ Technical Details

### Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **AI Integration**: Google Gemini Vision API
- **PWA Features**: Service Worker, Web App Manifest
- **Storage**: Local Storage for data persistence
- **Audio**: Web Speech API for pronunciation

### Browser Compatibility
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

### File Structure
```
├── index.html          # Main application
├── script.js           # JavaScript functionality
├── styles.css          # Styling and themes
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── icons/             # App icons
└── README.md          # This file
```

## 🔧 Configuration

### Customization
- Modify colors and themes in `styles.css`
- Adjust API prompts in `script.js`
- Update PWA settings in `manifest.json`

### API Configuration
The app uses the Gemini Vision API for image processing. The prompt is optimized for:
- English-Arabic word pairs
- Clear text extraction
- Structured JSON output
- Example sentence generation

## 📱 PWA Features

- **Offline Support**: Works without internet connection
- **Installable**: Add to home screen like a native app
- **Responsive**: Optimized for mobile and desktop
- **Fast Loading**: Cached resources for quick access

## 🔒 Privacy & Security

- **Local Storage**: All data stored locally on your device
- **API Key Security**: API keys stored securely in browser storage
- **No Server**: No data sent to external servers (except Gemini API)
- **Privacy First**: Your flashcards and progress remain private

## 🐛 Troubleshooting

### Common Issues

**Image Extraction Not Working:**
- Check your API key is correct
- Ensure image is clear and contains readable text
- Verify image size is under 10MB
- Check browser console for error messages

**Audio Not Playing:**
- Ensure browser supports Web Speech API
- Check system audio settings
- Try refreshing the page

**Data Not Saving:**
- Check browser storage permissions
- Ensure sufficient storage space
- Try clearing browser cache

### Performance Tips
- Use compressed images for faster uploads
- Close other tabs to free up memory
- Update browser to latest version

## 🤝 Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Improving documentation
- Submitting pull requests

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Google Gemini API for AI-powered image processing
- Web Speech API for audio functionality
- PWA community for progressive web app standards

---

**Happy Learning! 📚✨**
