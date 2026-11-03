import SalesModule from '@/components/SalesModule';
export default function PresupuestoPage({params}:{params:{id:string}}){return <SalesModule documentId={params.id}/>;}
