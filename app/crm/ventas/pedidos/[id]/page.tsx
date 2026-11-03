import SalesModule from '@/components/SalesModule';
export default function PedidoPage({params}:{params:{id:string}}){return <SalesModule view="pedido" documentId={params.id}/>;}
