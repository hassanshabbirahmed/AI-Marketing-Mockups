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
  { id: 'magazine', name: 'Magazine Cover', prompt: 'Feature this image as the cover of a high-fashion magazine. Add a title like "VOGUE" or "STYLE" at the top, with some headline text overlaying the image in a stylish, modern font. Ensure the lighting looks professional and glossy.' },
  { id: 'packaging', name: 'Product Packaging', prompt: 'Place this image onto a 3D product box for a luxury item, like perfume or a tech gadget. The box should be sitting on a clean, reflective surface with soft, studio lighting. The image should look like it is printed on high-quality matte-finish cardboard.' },
  { id: 'banner', name: 'Digital Ad Banner', prompt: 'Display this image within a sleek digital ad banner on a popular tech news website. The banner should be in a 728x90 leaderboard format, and the surrounding website content should be slightly blurred to draw focus. The image should look crisp and vibrant as if on a high-resolution screen.' },
  { id: 'social_post', name: 'Social Media Post', prompt: 'Show this image as part of a professionally designed Instagram post. The image should be in a square frame, viewed on a smartphone held by a person in a bright, casual setting like a cafe. Include a fake username, likes count, and a short caption below the image.' }
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

  const handleDownloadClick = useCallback(() => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    const mimeType = generatedImage.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1];
    const extension = mimeType ? mimeType.split('/')[1] : 'png';
    link.download = `marketing-mockup.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedImage]);

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
            <div class="result-content">
              <img class="result-image" src=${generatedImage} alt="Generated marketing mockup" />
              <button class="download-button" onClick=${handleDownloadClick}>
                Download Mockup
              </button>
            </div>
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