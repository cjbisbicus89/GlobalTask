// src/app/requests/new/page.tsx
import CreditRequestForm from "@/components/forms/CreditRequestForm";

export default function NewRequestPage() {
  return (
    /* Eliminamos max-w-2xl para que use todo el ancho del layout */
    <div className="w-full">
      <div className="mb-8">       
        <p className="text-gray-500 text-sm">Completa los datos para iniciar tu proceso de crédito.</p>
      </div>
      
     
      <CreditRequestForm />
    </div>
  );
}