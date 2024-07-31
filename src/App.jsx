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
    <div className=' w-full min-h-screen bg-slate-800 p-10 flex flex-col gap-16 items-center'>
      <div className=' text-white text-7xl font-semibold'>ImageVerse</div>

      <input
        type="file"
        accept="image/png, image/jpeg"
        multiple
        onChange={handleFileChange}
      />

      <div className=' w-1/2'>
        <div className=" h-12 border-2 border-blue-400 rounded-md flex overflow-hidden">
                  <input type="text" className="w-full focus:outline-none p-2" onChange={(e)=>{setPromptInput(e.target.value)}}/>
                  <button onClick={run} disabled={loading} className=' bg-lime-400 px-4 text-slate-700 font-semibold'>{loading ? 'Processing....' : "Ask"}</button>
        </div>
        <p className=' text-white'>**  If you do not provide any prompt, information or comparison of the images will be displayed.</p>
      </div>

      <div className=' h-2/4 w-1/2 bg-white p-2 rounded-md'>
        {loading ? 'Loading....' : "Your results are shown here : \n"+ result}
      </div>

    </div>
  );
}
