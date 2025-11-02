'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Headers/page';
import Footer from '@/components/Footer/page';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        telefono: '',
        contraseña: '',
        verificarContraseña: '',
        rol: 'Cliente',
        faceDescriptor: null, // Campo para el descriptor facial
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [faceLoading, setFaceLoading] = useState(false);
    const [faceRegistered, setFaceRegistered] = useState(false);
    const videoRef = useRef();

    useEffect(() => {
        const loadModels = async () => {
            try {
                const faceapi = await import('face-api.js');
                const MODEL_URL = '/models';
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
                await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
                setModelsLoaded(true);
            } catch (e) {
                console.error("Error al cargar modelos de face-api:", e);
                setError(`Error al cargar modelos de IA: ${e.message}. No se podrá registrar el rostro.`);
            }
        };
        loadModels();
    }, []);

    const handleRegisterFace = async () => {
        if (!modelsLoaded) {
            setError("Los modelos de IA no han cargado. Intente de nuevo.");
            return;
        }
        setFaceLoading(true);
        setError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            await new Promise(resolve => { videoRef.current.onloadedmetadata = resolve; });
            videoRef.current.play();

            const faceapi = await import('face-api.js');
            const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
            
            if (!detection) {
                throw new Error("No se detectó ningún rostro. Asegúrese de estar bien iluminado.");
            }

            setFormData(prev => ({ ...prev, faceDescriptor: Array.from(detection.descriptor) }));
            setFaceRegistered(true);
        } catch (err) {
            setError(err.message || "Error al registrar el rostro.");
        } finally {
            videoRef.current?.srcObject?.getTracks().forEach(track => track.stop());
            setFaceLoading(false);
        }
    };
    
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.contraseña !== formData.verificarContraseña) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (formData.contraseña.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);

        try {
            // Enviamos los datos sin el campo de verificación de contraseña
            const { verificarContraseña, ...dataToSend } = formData;

            const res = await fetch('/superUser/gestion/api', { // CORREGIDO: Apuntar a la API de gestión de usuarios correcta
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al registrar el usuario.');
            }

            const newUser = await res.json();
            localStorage.setItem('loggedInUser', JSON.stringify({
                id: newUser.id,
                nombre: newUser.nombre,
                rol: newUser.rol,
            }));

            alert(`¡Bienvenido, ${newUser.nombre}! Registro exitoso.`);
            router.push('/login'); // CORREGIDO: Redirigir al login para que el usuario inicie sesión
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-yellow-100 to-pink-100">
            <div className="w-full">
                <Header />
            </div>
            <div className="flex-1 flex items-center justify-center my-10">
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Registro de Usuario</h1>
                    
                    {faceLoading && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50">
                            <h2 className="text-white text-2xl mb-4">Mire a la cámara...</h2>
                            <video ref={videoRef} width="320" height="240" autoPlay muted className="rounded-lg"></video>
                            <button 
                                onClick={() => {
                                    videoRef.current?.srcObject?.getTracks().forEach(track => track.stop());
                                    setFaceLoading(false);
                                }} 
                                className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600">
                                Cancelar
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">Nombre Completo</label>
                            <input type="text" id="nombre" value={formData.nombre} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-300" required />
                        </div>
                        <div>
                            <label htmlFor="correo" className="block text-gray-700 text-sm font-bold mb-2">Correo Electrónico</label>
                            <input type="email" id="correo" value={formData.correo} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-300" required />
                        </div>
                        <div>
                            <label htmlFor="telefono" className="block text-gray-700 text-sm font-bold mb-2">Teléfono</label>
                            <input type="tel" id="telefono" value={formData.telefono} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-300" required />
                        </div>
                        <div>
                            <label htmlFor="contraseña" className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
                            <input type="password" id="contraseña" value={formData.contraseña} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-pink-400" required />
                        </div>
                        <div>
                            <label htmlFor="verificarContraseña" className="block text-gray-700 text-sm font-bold mb-2">Verificar Contraseña</label>
                            <input type="password" id="verificarContraseña" value={formData.verificarContraseña} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-pink-400" required />
                        </div>

                        <div className="border-t pt-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Reconocimiento Facial (Opcional)</label>
                            <button
                                type="button"
                                onClick={handleRegisterFace}
                                disabled={!modelsLoaded || faceRegistered}
                                className={`w-full flex justify-center items-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
                                    faceRegistered ? 'bg-green-600' : 
                                    modelsLoaded ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400'
                                }`}
                            >
                                {faceRegistered ? 'Rostro Registrado ✔' : (modelsLoaded ? 'Registrar Rostro' : 'Cargando IA...')}
                            </button>
                        </div>
                        {error && (
                            <p className="text-red-500 text-xs italic text-center">{error}</p>
                        )}
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-blue-500 via-yellow-400 to-pink-400 hover:from-blue-600 hover:via-yellow-500 hover:to-pink-500 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 w-full disabled:opacity-50 transition-all duration-200"
                            disabled={loading}
                        >
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </button>
                    </form>
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            ¿Ya tienes una cuenta?{' '}
                            <Link href="/login" className="font-medium text-blue-500 hover:text-blue-600">
                                Inicia sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            <div className="w-full mt-8">
                <Footer />
            </div>
        </div>
    );
}
