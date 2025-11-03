"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Headers from "@/components/Headers/page";
import Footer from "@/components/Footer/page";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceLoading, setFaceLoading] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const faceapi = await import("face-api.js");
        const MODEL_URL = "/models";
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        try { await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL); } catch (e) { /* optional */ }
        setModelsLoaded(true);
      } catch (e) {
        console.error(e);
        setLoginError("Error al cargar los modelos de reconocimiento facial.");
      }
    })();
  }, []);

  const redirectByRole = (rol) => {
    const map = { SUPERUSER: "/superUser", Administrador: "/admin", Cliente: "/clientes" };
    router.push(map[rol] || "/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al iniciar sesión");
      localStorage.setItem("loggedInUser", JSON.stringify(data.user));
      redirectByRole(data.user?.rol);
    } catch (err) {
      setLoginError(err.message || "Error de conexión");
    } finally { setLoading(false); }
  };

  const startFaceLogin = async () => {
    if (!modelsLoaded) { setLoginError("Modelos no cargados"); return; }
    setFaceLoading(true); setLoginError("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = s;
      await new Promise(r => { videoRef.current.onloadedmetadata = r; videoRef.current.play(); });
      const faceapi = await import("face-api.js");
      const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
      if (!detection) throw new Error("No se detectó rostro");
      const res = await fetch("/api/auth/face-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ faceDescriptor: Array.from(detection.descriptor) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "No reconocido");
      localStorage.setItem("loggedInUser", JSON.stringify(data.user));
      redirectByRole(data.user?.rol);
    } catch (e) {
      setLoginError(e.message || "Error reconocimiento facial");
    } finally {
      setFaceLoading(false);
      try { const s = videoRef.current?.srcObject; s?.getTracks?.().forEach(t => t.stop()); } catch (_) {}
    }
  };

  const stopCamera = () => { try { const s = videoRef.current?.srcObject; s?.getTracks?.().forEach(t => t.stop()); } catch (_) {} setFaceLoading(false); };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-yellow-100 to-pink-100">
      <Headers/>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-6 rounded shadow">
          {faceLoading && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-60">
              <h2 className="text-white mb-4">Mirando a la cámara...</h2>
              <video ref={videoRef} autoPlay muted className="w-80 h-56 bg-black rounded" />
              <button onClick={stopCamera} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Cancelar</button>
            </div>
          )}

          <h1 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h1>

          {loginError && <div className="mb-3 text-red-600">{loginError}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded" />
            <div className="text-right"><Link href="/forgot-password" className="text-sm text-blue-600">¿Olvidaste tu contraseña?</Link></div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">{loading ? 'Ingresando...' : 'Ingresar'}</button>
          </form>

          <div className="my-4 flex items-center before:flex-1 before:border-t before:border-gray-300 after:flex-1 after:border-t after:border-gray-300">
            <p className="mx-4 mb-0 text-center font-semibold text-gray-500">O</p>
          </div>

          <button onClick={startFaceLogin} disabled={!modelsLoaded || faceLoading} className="w-full px-3 py-2 rounded bg-green-500 text-white disabled:bg-gray-400">
            {modelsLoaded ? 'Iniciar con Face ID' : 'Cargando Face ID...'}
          </button>

          <div className="mt-4 text-center">
            <p className="text-sm">¿No tienes una cuenta? <Link href="/register" className="text-blue-600">Regístrate</Link></p>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
}