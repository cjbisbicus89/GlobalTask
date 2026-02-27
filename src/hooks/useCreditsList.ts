import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface CreditRequest {
  id: string;
  countryCode: string;
  amount: string;
  currencyCode: string;
  currentStatusId: number;
  requestedAt: string;
}

interface Filters {
  country: string;
  status: string;
  start: string;
  end: string;
}

export function useCreditsList() {
  const [data, setData] = useState<CreditRequest[]>([]);
  const [filters, setFilters] = useState<Filters>({ 
    country: "", 
    status: "", 
    start: "2026-01-01", 
    end: "2026-12-31" 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true); 

  const itemsPerPage = 6;

  const fetchCredits = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/credits", {
        params: {
          start: filters.start,
          end: filters.end,
          country: filters.country || undefined,
          status: filters.status || undefined,
          page: currentPage,
          limit: itemsPerPage
        }
      });
      
      if (response.data.success) {
        setData(response.data.data);
        setTotalResults(response.data.total);
        setTotalPages(response.data.lastPage);
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage]);

 const updateRequestStatus = async (requestId: string, nextStatusId: number) => {
    try {
      const response = await api.patch(`/credits/${requestId}/status`, {
        nextStatusId
      });
      
      if (response.status === 200 || response.data.success) {
        await fetchCredits(); 
        return { success: true };
      }
    } catch (error: any) {
      
      console.error("Error updating status:", error);
      
      const errorMessage = "No es posible cambiar el estado de la solicitud de crédito.";
          
      const detail = error.response?.data?.message || "";      
      alert(`${errorMessage}\n${detail}`);
      
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const updateFilter = (name: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  return { 
    data, 
    filters, 
    updateFilter, 
    currentPage, 
    setCurrentPage, 
    totalPages,
    totalResults,
    isLoading,
    refresh: fetchCredits,
    updateRequestStatus // Nueva función expuesta
  };
}