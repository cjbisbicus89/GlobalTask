-- 1. Gestión de Índices
DROP INDEX IF EXISTS "tab_credit_requests_countryCode_idx";

CREATE INDEX IF NOT EXISTS "tab_credit_requests_countryCode_currentStatusId_idx" 
ON "tab_credit_requests"("countryCode", "currentStatusId");

CREATE INDEX IF NOT EXISTS "tab_credit_requests_requestedAt_idx" 
ON "tab_credit_requests"("requestedAt" DESC);

-- Limpieza de objetos previos
DROP TRIGGER IF EXISTS trg_credit_status_update ON "tab_credit_requests";
DROP FUNCTION IF EXISTS fn_audit_credit_status_change();

-- Función de Auditoría Nativa
CREATE OR REPLACE FUNCTION fn_audit_credit_status_change()
RETURNS TRIGGER AS $$
BEGIN
    
    IF (OLD."currentStatusId" IS DISTINCT FROM NEW."currentStatusId") THEN         
        
        
        INSERT INTO "tab_request_history" (
            "idHistory", 
            "idCredit",    
            "fromStatusId", 
            "toStatusId", 
            "changedAt", 
            "correlationId", 
            "metadata"
        ) VALUES (
            gen_random_uuid(), 
            NEW."id",      
            OLD."currentStatusId", 
            NEW."currentStatusId", 
            NOW(), 
            gen_random_uuid(), 
            jsonb_build_object('engine', 'native_trigger', 'source', 'db_level')
        );

        -- Inserción en tab_background_jobs 
        INSERT INTO "tab_background_jobs" (
            "idJob", 
            "idCredit", 
            "jobType", 
            "status", 
            "attempts", 
            "createdAt"
        ) VALUES (
            gen_random_uuid(), 
            NEW."id", 
            'SEND_STATUS_NOTIFICATION', 
            'PENDING', 
            0, 
            NOW()
        );
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_credit_status_update
AFTER UPDATE ON "tab_credit_requests"
FOR EACH ROW
EXECUTE FUNCTION fn_audit_credit_status_change();