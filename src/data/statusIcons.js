// Ícones (JSX) por status, usados em telas que renderizam componentes React
// (Legend, etc). Separado de statusConfig.js porque o `emoji` de lá é texto
// puro, usado em <option> e na mensagem de WhatsApp — contextos que não
// aceitam ícones React.
import {
  IoEllipseOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCubeOutline,
  IoHeartOutline,
} from 'react-icons/io5';
import { STATUS } from './statusConfig';

export const STATUS_ICONS = {
  [STATUS.LIVRE]: IoEllipseOutline,
  [STATUS.RESERVADO]: IoTimeOutline,
  [STATUS.PAGO]: IoCheckmarkCircleOutline,
  [STATUS.ENTREGUE]: IoCubeOutline,
  [STATUS.PATROCINIO]: IoHeartOutline,
};
