"use client";
import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

/** Campo de senha com botão de olho: clique mostra, clique de novo esconde. */
export function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  return <span className="pw-field">
    <input {...props} type={visible ? "text" : "password"} />
    <button type="button" className="pw-toggle" onClick={() => setVisible(value => !value)} aria-label={visible ? "Ocultar senha" : "Mostrar senha"} aria-pressed={visible} title={visible ? "Ocultar senha" : "Mostrar senha"}>
      {visible ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  </span>;
}
