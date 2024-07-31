// App.jsx or App.tsx
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useState } from 'react';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);

const fileToGenerativePart = async (file, mimeType) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const data = reader.result.split(',')[1]; // Extract base64 data
      resolve({
        inlineData: {
          data,
          mimeType
        }
      });
    };

    reader.onerror = (error) => reject(error);

    reader.readAsDataURL(file);
  });
};

export default function App() {
  const [result, setResult] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ promptInput , setPromptInput ] = useState("");

  const handleFileChange = (event) => {
    setFiles(event.target.files);
  };

  const run = async () => {
    if (files.length === 0) {
      alert('Please select at least one image.');
      return;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Dynamically create prompt based on number of images
    const prompt = promptInput

    setLoading(true); // Start loading

    try {
      const imageParts = await Promise.all(
        Array.from(files).map((file) => fileToGenerativePart(file, file.type))
      );

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = await response.text();
      setResult(text); // Set the result
    } catch (error) {
      console.error('Error processing images:', error);
      setResult('Error processing images');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/png, image/jpeg"
        multiple
        onChange={handleFileChange}
      />
      <input
        type="text"
        placeholder="Enter your prompt here"
        value={promptInput}
        onChange={(e) => {
          setPromptInput(e.target.value);
        }}></input>
      <button onClick={run} disabled={loading}>
        {loading ? 'Processing...' : 'Click to get results'}
      </button>
      <div>
        {loading ? 'Loading...' : result}
      </div>
    </div>
  );
}
