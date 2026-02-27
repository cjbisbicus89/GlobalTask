import { Router } from 'express';
import { CreditController } from './CreditController';

const router = Router();
const creditController = new CreditController();


//creacion de solicitud
router.post('/', (req, res) => creditController.create(req, res));

//listado y filtros
router.get('/', (req, res) => creditController.list(req, res));

//detalle de la solicitud
router.get('/:id', (req, res) => creditController.getById(req, res));

//actualizacion de estado
router.patch('/:id/status', (req, res) => creditController.updateStatus(req, res));

// consumo de proveedores externos
router.post('/webhooks/external', (req, res) => creditController.receiveExternalWebhook(req, res));

export default router;