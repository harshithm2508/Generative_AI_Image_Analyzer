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

  const handleFileChange = (event) => {
    setFiles(event.target.files);
  };

  const run = async () => {
    if (files.length < 2) {
      alert('Please select two images.');
      return;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = "What's the difference between these pictures?";

    setLoading(true); // Start loading

    try {
      const imageParts = await Promise.all([
        fileToGenerativePart(files[0], files[0].type),
        fileToGenerativePart(files[1], files[1].type),
      ]);

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
      <button onClick={run}>Click to get results</button>
      <div>
        {loading ? 'Loading...' : result}
      </div>
    </div>
  );
}
