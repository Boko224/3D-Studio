import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import { useUser } from '../context/UserContext';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { db, storage } from '../config/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const UploadPage = () => {
  const { user } = useUser();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill form data when user is logged in
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.uid) {
        try {
          // Load user profile from Firestore
          const userDocRef = doc(db, 'userProfiles', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setFormData((prev) => ({
              ...prev,
              name: user.displayName || userData.displayName || prev.name,
              email: user.email || userData.email || prev.email,
              phone: userData.phone || prev.phone,
            }));
          } else {
            // If no profile data, just use auth data
            setFormData((prev) => ({
              ...prev,
              name: user.displayName || prev.name,
              email: user.email || prev.email,
            }));
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Fallback to basic auth data
          setFormData((prev) => ({
            ...prev,
            name: user.displayName || prev.name,
            email: user.email || prev.email,
          }));
        }
      }
    };

    loadUserData();
  }, [user]);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_TYPES = ['.stl', '.obj', '.gcode'];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    handleFiles(droppedFiles);
  };

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    handleFiles(selectedFiles);
  };

  const handleFiles = (fileList) => {
    const validFiles = [];
    const errors = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();

      // Validation
      if (!ALLOWED_TYPES.includes(fileExt)) {
        errors.push(`${file.name} - Неподдържан формат. Позволени: ${ALLOWED_TYPES.join(', ')}`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} - Файлът е твърде голям (макс. 50MB)`);
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      alert('Грешки при качване:\n' + errors.join('\n'));
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    console.log('🔵 handleSubmit CALLED');
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.description) {
      alert('Моля, попълни всички задължителни полета!');
      return;
    }

    if (files.length === 0) {
      alert('Моля, качи поне един файл!');
      return;
    }

    console.log('🟡 Validation passed, setting isSubmitting...');
    setIsSubmitting(true);

    try {
      console.log('🟠 Creating upload data...');
      const uploadData = {
        customerInfo: formData,
        files: files.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
        requestStatus: 'pending',
        createdAt: serverTimestamp(),
      };

      console.log('🟠 DB instance:', db);
      console.log('🟠 Saving to Firestore...');
      // Записване в Firebase
      const docRef = await addDoc(collection(db, 'modelRequests'), uploadData);
      console.log('✅ Upload saved with ID:', docRef.id);

      // Записване и в localStorage за backup
      localStorage.setItem('lastUpload', JSON.stringify({ ...uploadData, id: docRef.id }));

      // Show success message
      setSubmitted(true);

      // Reset form
      setTimeout(() => {
        setFormData({ name: '', email: '', phone: '', description: '' });
        setFiles([]);
        setSubmitted(false);
      }, 4000);
    } catch (error) {
      console.error('❌ Error saving upload request:', error);
      console.error('Error details:', error.message, error.code);
      alert(`❌ Грешка: ${error.message}\n\nОпитай отново или контактувай поддръжката.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">✅</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Успешно изпратено!</h1>
          <p className="text-gray-600 mb-2">
            Благодарим за качването! Ще получиш цена в рамките на 24 часа на имейла си.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <section className="hero-bg text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Качи твой 3D модел</h1>
          <p className="text-gray-300 text-lg">
            Поддържаме .STL, .OBJ, и .GCODE файлове до 50MB
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          {/* Upload Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-300 bg-white hover:border-indigo-400'
            }`}
          >
            <Upload className="mx-auto mb-4 text-indigo-600" size={48} />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Влачи файлове тук или щракни
            </h3>
            <p className="text-gray-600 mb-6">
              Поддържани формати: .STL, .OBJ, .GCODE (макс. 50MB)
            </p>
            <input
              type="file"
              multiple
              accept=".stl,.obj,.gcode"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="inline-block">
              <div className="font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg cursor-pointer inline-block">
                Избери файлове
              </div>
            </label>
          </div>

          {/* Uploaded Files */}
          {files.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Качени файлове ({files.length})</h3>
              <div className="space-y-3">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📄</div>
                      <div>
                        <div className="font-semibold text-gray-900">{file.name}</div>
                        <div className="text-sm text-gray-600">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-12 bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Детайли за поръчката</h2>

            <div className="space-y-6">
              <Input
                label="Име *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Твоето име"
                required
              />

              <Input
                label="Email *"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="твоят@email.com"
                required
              />

              <Input
                label="Телефон (по желание)"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+359 88..."
              />

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Описание на проекта *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Кажи ни повече за това, което искаш да се отпечата..."
                  rows="6"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 resize-none"
                  required
                ></textarea>
              </div>

              {/* Important Info */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <div className="flex gap-3">
                  <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-blue-900">Важно</h4>
                    <p className="text-sm text-blue-800">
                      Ще получиш цена за 3D печат в рамките на 24 часа. Имайте предвид, че крайната цена зависи от размера, сложността на модела и избрания материал.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full text-lg py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>⏳ Обработка...</>
                ) : (
                  <>
                    <Upload size={20} />
                    Изпрати заявката
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* FAQ */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">Често задавани въпроси</h3>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-2">📁 Какви файлови формати приемаш?</h4>
                <p className="text-gray-600">
                  Приемаме .STL, .OBJ и .GCODE файлове. Максималният размер е 50MB.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-2">⏱️ Колко време отнема?</h4>
                <p className="text-gray-600">
                  Ще получиш цена в рамките на 24 часа, а печатането отнема 3-7 работни дни в зависимост от сложността.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-2">💰 Как се определя цената?</h4>
                <p className="text-gray-600">
                  Цената зависи от: размер на модела, обем на материала, желания материал (PLA, PETG, Resin), и времето за печат.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UploadPage;
