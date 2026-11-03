import { TIPO_EVENTO_LABEL, FRANJA_HORARIA_LABEL, type TipoEvento, type FranjaHoraria } from './types';

export type SalesOpportunity = {
 id:string;cliente_id:string;tipo_evento:TipoEvento;tipo_evento_otro?:string|null;
 fecha_evento:string|null;num_invitados:number|null;ubicacion_evento?:string|null;
 comercial_id:string|null;franja_horaria?:FranjaHoraria|null;restricciones?:string|null;mensaje?:string|null;
};

// Read only the labelled section produced by the public form's compatibility
// fallback. Never substitute the CRM simulator's locations for client answers.
function savedAnswer(message:string,label:string) {
 const marker='Datos del evento:\n';const start=message.lastIndexOf(marker);
 if(start<0)return '';
 const section=message.slice(start+marker.length);
 const labels=['Franja horaria','Ubicación del evento','Restricciones alimentarias o alergias','Cómo nos conoció'];
 const lines=section.split('\n');const index=lines.findIndex(line=>line.startsWith(label+': '));
 if(index<0)return '';
 const answer=[lines[index].slice(label.length+2)];
 for(let i=index+1;i<lines.length;i++){if(labels.some(next=>lines[i].startsWith(next+': ')))break;answer.push(lines[i]);}
 return answer.join('\n').trim();
}

export function salesOpportunityPrefill(item:SalesOpportunity) {
 const message=item.mensaje||'';
 const location=item.ubicacion_evento?.trim()||savedAnswer(message,'Ubicación del evento');
 const slot=item.franja_horaria?FRANJA_HORARIA_LABEL[item.franja_horaria]:savedAnswer(message,'Franja horaria');
 const restrictions=item.restricciones?.trim()||savedAnswer(message,'Restricciones alimentarias o alergias');
 return {
  evento:item.tipo_evento==='otro'?item.tipo_evento_otro?.trim()||'Otro evento':TIPO_EVENTO_LABEL[item.tipo_evento],
  ubicacion:location,
  notas:[slot?`Franja horaria: ${slot}`:'',restrictions?`Restricciones alimentarias o alergias: ${restrictions}`:''].filter(Boolean).join('\n'),
 };
}
