import { useState } from "react";
import { api } from "@/lib/api";

export const countryDocs: Record<string, { doc: string; label: string; currency: string }> = {
  ES: { doc: "DNI", label: "España", currency: "EUR" },
  PT: { doc: "NIF", label: "Portugal", currency: "EUR" },
  IT: { doc: "Codice Fiscale", label: "Italia", currency: "EUR" },
  MX: { doc: "CURP", label: "México", currency: "MXN" },
  CO: { doc: "CC", label: "Colombia", currency: "COP" },
  BR: { doc: "CPF", label: "Brasil", currency: "BRL" },
};

const INITIAL_STATE = {
  fullName: "",
  amount: "",
  monthlyIncome: "",
  docNumber: "",
  email: "",
  phone: ""
};

export function useCreditRequest() {
  const [country, setCountry] = useState("ES");
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const countryConfig = countryDocs[country];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "El nombre es obligatorio";
    if (!formData.docNumber.trim()) newErrors.docNumber = "El documento es obligatorio";
    if (!formData.phone.trim()) newErrors.phone = "El teléfono es obligatorio";
    if (!formData.amount || Number(formData.amount) <= 0) newErrors.amount = "Monto inválido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email inválido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // 1. Auth para obtener/actualizar Token
      const authRes = await api.post("/auth", {
        email: "cjbisbicus@gmail.com",
        password: "admin123"
      });

      if (authRes.data.token) {
        localStorage.setItem("token", authRes.data.token);
      }

      // 2. Mapeo al JSON que pide tu endpoint /credits
      const creditPayload = {
        countryCode: country,
        amount: parseFloat(formData.amount),
        monthlyIncome: parseFloat(formData.monthlyIncome),
        currencyCode: country, 
        fullName: formData.fullName,
        docType: countryConfig.doc,
        docNumber: formData.docNumber,
        email: formData.email,
        phone: formData.phone
      };

      // 3. Guardar Solicitud
      await api.post("/credits", creditPayload);
      
      setIsSuccess(true);
      setFormData(INITIAL_STATE); 
    } catch (err: any) {
      console.error("Error al guardar:", err);
      setErrors({ global: err.response?.data?.message || "Hubo un error al procesar tu solicitud." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { country, setCountry, formData, errors, isSubmitting, isSuccess, handleChange, handleSubmit, countryConfig };
}