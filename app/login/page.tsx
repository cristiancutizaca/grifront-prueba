"use client";
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import Image from "next/image";

const Login: React.FC = () => {
  const [resErrors, setResErrors] = useState<{ message: string } | null>(null);
  const [form, setForm] = useState({ username: "", password: "" });
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleFormData = (
    { target }: React.ChangeEvent<HTMLInputElement>,
    textField: string
  ) => {
    const { value } = target;
    setForm({ ...form, [textField]: value });
  };

  const onSubmit = async () => {
    try {
      console.log("🟢 Enviando al backend:", form);

      const response = await axios.post("http://localhost:8000/auth/login", {
        username: form.username,
        password: form.password,
      });

      console.log("🔵 Respuesta del login:", response.data);

      if (response.data?.access_token) {
        localStorage.setItem("authToken", response.data.access_token);
        console.log("✅ Token recibido, redirigiendo...");
        window.location.href = "/grifo";
      } else {
        setResErrors({ message: "Credenciales incorrectas" });
      }
    } catch (error: any) {
      console.error("🔴 Error en login:", error.response?.data || error.message);
      setResErrors({ message: "Credenciales incorrectas" });
      setTimeout(() => setResErrors(null), 3000);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/image/fondE.jpeg')",
      }}
    >
      <div className="flex w-[900px] h-[500px] backdrop-blur-sm dark:backdrop-blur-md bg-transparent rounded-xl shadow-lg overflow-hidden">
        {/* Lado izquierdo - Bienvenida */}
        <div className="w-1/2 flex items-center justify-center bg-gradient-to-t from-black/70 to-blue-700/10 hidden md:flex">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">BIENVENIDO DE NUEVO</h1>
            <p className="text-sm mb-4">¡Qué bueno verte de nuevo!</p>
            <p className="text-xs">
              "Alcanza tus metas y construye un futuro más brillante con nosotros."
            </p>
          </div>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="w-full md:w-1/2 p-8 bg-gradient-to-t from-black/50 to-blue-700/10 flex flex-col justify-center items-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/image/inaltlogcert.png"
              alt="Logo"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-center mb-6 text-white">
            Iniciar sesión
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault(); // 🔒 evita que se envíe como GET
              onSubmit();         // ✅ llama la función que hace POST con axios
            }}
          >

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-white">
                Nombre de usuario
              </label>
              <div className="flex items-center bg-white/20 border-2 border-gray-300 rounded-full pl-3 focus-within:border-blue-500">
                <input
                  type="text"
                  placeholder="Usuario"
                  className="input flex-1 bg-transparent border-transparent focus:outline-none ml-3 placeholder-gray-300 text-white"
                  value={form.username}
                  onChange={(e) => handleFormData(e, "username")}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col mb-4">
              <label className="text-sm font-semibold text-white">
                Contraseña
              </label>
              <div className="inputForm flex items-center bg-white/20 border-2 border-gray-300 rounded-full pl-3 focus-within:border-blue-500">
                <input
                  type={isVisible ? "text" : "password"}
                  placeholder="Contraseña"
                  className="input flex-1 bg-transparent border-transparent focus:outline-none ml-3 placeholder-gray-300 text-white"
                  value={form.password}
                  onChange={(e) => handleFormData(e, "password")}
                  required
                />
                <button
                  type="button"
                  onClick={toggleVisibility}
                  className="px-3 text-white"
                >
                  {isVisible ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
            </div>

            {resErrors && (
              <p className="text-red-500 text-center">{resErrors.message}</p>
            )}

            <button className="button-submit text-white w-full py-3 rounded-full bg-transparent border-2 border-white transition-all duration-300 ease-in-out hover:bg-blue-600">
              Iniciar Sesión
            </button>
          </form>
          <div className="flex justify-between items-center mt-4 text-sm text-gray-300">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox text-blue-600" />
              <span>Mantenerme conectado</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;