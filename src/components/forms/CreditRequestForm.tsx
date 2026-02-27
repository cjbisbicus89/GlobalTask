"use client";
import { useCreditRequest, countryDocs } from "@/hooks/useCreditRequest";
import { FormInputField } from "./FormInputField";

export default function CreditRequestForm() {
  const { 
    country, setCountry, formData, errors, isSubmitting, 
    isSuccess, handleChange, handleSubmit, countryConfig 
  } = useCreditRequest();

  if (isSuccess) {
    return (
      <div className="w-full bg-white p-20 rounded-[40px] shadow-2xl text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl">✓</div>
        <h2 className="text-4xl font-black text-[#0f0b36]">¡Solicitud Recibida!</h2>
        <p className="text-gray-500 text-lg">Nuestro motor está analizando tu perfil. Te contactaremos pronto.</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-[#ff7a3d] font-bold">Enviar otra solicitud</button>
      </div>
    );
  }

  return (
    <section className="w-full bg-white shadow-[0_30px_80px_rgba(0,0,0,0.08)] rounded-[40px] border border-gray-50 p-16">
      <Header />
      {errors.global && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold">
          {errors.global}
        </div>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-10">
          <SectionHeader number={1} title="Información Personal" color="bg-[#ff7a3d]" />
          <div className="space-y-8">
            <FormInputField label="Nombre Completo*" name="fullName" value={formData.fullName} error={errors.fullName} onChange={handleChange} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <ReadOnlyField label="Tipo" value={countryConfig.doc} />
              <div className="sm:col-span-2">
                <FormInputField label="Número de Documento*" name="docNumber" value={formData.docNumber} error={errors.docNumber} onChange={handleChange} />
              </div>
            </div>
            <FormInputField label="Correo*" name="email" type="email" value={formData.email} error={errors.email} onChange={handleChange} />
            <FormInputField label="Teléfono*" name="phone" type="tel" value={formData.phone} error={errors.phone} onChange={handleChange} />
          </div>
        </div>

        <div className="space-y-10">
          <SectionHeader number={2} title="Detalles del Crédito" color="bg-[#0f0b36]" />
          <div className="space-y-8">
            <CountrySelector value={country} onChange={setCountry} />
            <FormInputField label={`Monto (${countryConfig.currency})*`} name="amount" type="number" value={formData.amount} error={errors.amount} onChange={handleChange} isCurrency />
            <FormInputField label="Ingresos Brutos*" name="monthlyIncome" type="number" value={formData.monthlyIncome} error={errors.monthlyIncome} onChange={handleChange} isCurrency />
            <LegalNotice countryLabel={countryConfig.label} />
          </div>
        </div>

        <FormFooter isSubmitting={isSubmitting} />
      </form>
    </section>
  );
}

const SectionHeader = ({ number, title, color }: any) => (
  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white font-bold shadow-lg`}>{number}</div>
    <h3 className="font-bold text-[#0f0b36] uppercase text-sm tracking-widest">{title}</h3>
  </div>
);

const ReadOnlyField = ({ label, value }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-bold text-[#0f0b36] ml-1">{label}</label>
    <div className="p-5 bg-gray-100 border border-gray-200 rounded-2xl font-black text-center">{value}</div>
  </div>
);

const CountrySelector = ({ value, onChange }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-bold text-[#0f0b36] ml-1">País de Residencia*</label>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="p-5 bg-gray-50/50 border border-gray-200 rounded-2xl outline-none font-medium"
    >
      {Object.entries(countryDocs).map(([code, data]) => (
        <option key={code} value={code}>{data.label} ({code})</option>
      ))}
    </select>
  </div>
);

const LegalNotice = ({ countryLabel }: any) => (
  <div className="p-8 bg-[#fcfaff] rounded-[32px] border border-[#ece7ff]">
    <p className="text-xs text-[#6b5a94] font-medium">
      Confirmas que la información es veraz bajo las leyes de {countryLabel}.
    </p>
  </div>
);

const FormFooter = ({ isSubmitting }: any) => (
  <div className="lg:col-span-2 pt-12 flex justify-between items-center border-t border-gray-50">
    <span className="text-sm text-gray-400 font-medium">Conexión cifrada</span>
    <button 
      type="submit"
      disabled={isSubmitting}
      className="bg-[#0f0b36] text-white px-20 py-6 rounded-[24px] font-black text-xl hover:bg-[#ff7a3d] transition-all disabled:opacity-50"
    >
      {isSubmitting ? "Procesando..." : "Procesar Crédito"}
    </button>
  </div>
);

const Header = () => (
  <div className="mb-14">   
    <h2 className="text-5xl font-black text-[#0f0b36] mt-6 tracking-tight">Nueva Solicitud</h2>
  </div>
);