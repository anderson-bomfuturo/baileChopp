// Ícone + cor por status, usados em telas que renderizam componentes React
// (seletor de status no popup, Legend, etc). Separado de statusConfig.js
// porque o `emoji` de lá é texto puro, usado na mensagem de WhatsApp — um
// contexto que não aceita ícones React.
import { MdCropFree } from 'react-icons/md';
import { IoIosCheckmarkCircle } from 'react-icons/io';
import { RiMoneyDollarCircleFill } from 'react-icons/ri';
import { GiReceiveMoney } from 'react-icons/gi';
import { SiHelpdesk } from 'react-icons/si';
import { STATUS } from './statusConfig';

export const STATUS_ICONS = {
  [STATUS.LIVRE]: { icon: MdCropFree, color: '#6B7280' },
  [STATUS.RESERVADO]: { icon: IoIosCheckmarkCircle, color: '#F59E0B' },
  [STATUS.PAGO]: { icon: RiMoneyDollarCircleFill, color: '#16A34A' },
  [STATUS.ENTREGUE]: { icon: GiReceiveMoney, color: '#3B82F6' },
  [STATUS.PATROCINIO]: { icon: SiHelpdesk, color: '#A855F7' },
};
