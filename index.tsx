import { render, h } from 'preact';
import { useState, useCallback } from 'preact/hooks';
import htm from 'htm';
import { GoogleGenAI, Modality } from "@google/genai";

const html = htm.bind(h);

const SCENES = [
  { id: 'bus_stop', name: 'Bus Stop', prompt: 'Place this image as a poster advertisement at a realistic, modern bus stop.' },
  { id: 'billboard', name: 'Building Billboard', prompt: 'Display this image on a large billboard on the side of a modern skyscraper in a bustling city.' },
  { id: 'mural', name: 'Street Mural', prompt: 'Paint this image as a vibrant, high-resolution mural on a brick wall in a trendy city street.' },
  { id: 'tshirt', name: 'T-Shirt', prompt: 'Print this image on the front of a white t-shirt worn by a model in a fashion photoshoot setting.' },
  { id: 'mug', name: 'Coffee Mug', prompt: 'Put this image on a ceramic coffee mug sitting on a wooden table in a cozy cafe.' },
  { id: 'laptop', name: 'Laptop Screen', prompt: 'Show this image as the wallpaper on a modern laptop screen, placed on a desk in a home office.' },
];

const App = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedScene, setSelectedScene] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage({ file, dataUrl: reader.result });
        setGeneratedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please upload a valid image file.');
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleGenerateClick = useCallback(async () => {
    if (!uploadedImage || !selectedScene) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const mimeType = uploadedImage.file.type;
      const base64ImageData = uploadedImage.dataUrl.split(',')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: [
            { inlineData: { data: base64ImageData, mimeType: mimeType } },
            { text: selectedScene.prompt },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });

      const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
      
      if (imagePart?.inlineData) {
        const base64ImageBytes = imagePart.inlineData.data;
        const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${base64ImageBytes}`;
        setGeneratedImage(imageUrl);
      } else {
        const textPart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
        const errorMessage = textPart?.text || "The model did not return an image. Please try a different image or scene.";
        setError(errorMessage);
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unexpected error occurred during generation.');
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, selectedScene]);

  return html`
    <div class="app-container">
      <aside class="controls-panel">
        <header class="header">
          <h1>AI Marketing Mockups</h1>
          <p>Visualize your designs in real-world scenarios.</p>
        </header>

        <section class="control-section" aria-labelledby="upload-heading">
          <h2 id="upload-heading">1. Upload Your Image</h2>
          <div 
            class=${`uploader ${isDragging ? 'dragging' : ''}`}
            onClick=${() => document.getElementById('file-input').click()}
            onDragOver=${onDragOver}
            onDragLeave=${onDragLeave}
            onDrop=${onDrop}
          >
            <p>Drag & drop image here, or <span>browse</span></p>
            <input 
              type="file" 
              id="file-input" 
              hidden 
              accept="image/*"
              onChange=${(e) => handleFileChange(e.target.files[0])}
            />
          </div>
          ${uploadedImage && html`
            <div class="image-preview">
              <img src=${uploadedImage.dataUrl} alt="Uploaded preview" />
            </div>
          `}
        </section>

        <section class="control-section" aria-labelledby="scene-heading">
          <h2 id="scene-heading">2. Choose a Scene</h2>
          <div class="scene-grid">
            ${SCENES.map(scene => html`
              <button 
                key=${scene.id}
                class=${`scene-card ${selectedScene?.id === scene.id ? 'selected' : ''}`}
                onClick=${() => setSelectedScene(scene)}
                aria-pressed=${selectedScene?.id === scene.id}
              >
                ${scene.name}
              </button>
            `)}
          </div>
        </section>

        <button 
          class="generate-button" 
          onClick=${handleGenerateClick} 
          disabled=${!uploadedImage || !selectedScene || isLoading}
          aria-disabled=${!uploadedImage || !selectedScene || isLoading}
        >
          ${isLoading ? 'Generating...' : 'Generate Mockup'}
        </button>
      </aside>

      <main class="result-panel" aria-live="polite">
        <div class="result-view">
          ${isLoading && html`<div class="skeleton-loader"></div>`}
          ${!isLoading && error && html`<p class="error-message">${error}</p>`}
          ${!isLoading && !error && generatedImage && html`
            <img class="result-image" src=${generatedImage} alt="Generated marketing mockup" />
          `}
          ${!isLoading && !error && !generatedImage && html`
            <div class="result-placeholder">
              <h2>Your generated mockup will appear here</h2>
              <p>Upload an image and select a scene to start.</p>
            </div>
          `}
        </div>
      </main>
    </div>
  `;
};

render(html`<${App} />`, document.getElementById('root'));