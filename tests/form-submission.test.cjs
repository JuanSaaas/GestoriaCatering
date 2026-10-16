const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const output={};
new Function('exports',ts.transpileModule(fs.readFileSync('lib/formSubmission.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(output);
const {saveFormRecord}=output;
const missing=column=>({code:'PGRST204',message:`Could not find the '${column}' column of 'oportunidades' in the schema cache`});
test('esquema actual: guarda todas las respuestas ampliadas en el mensaje sin duplicarlas',async()=>{
 const original={id:'same-id',cliente_id:'client',mensaje:'Celebración familiar',franja_horaria:'noche',ubicacion_evento:'Zaragoza',restricciones:'Sin gluten',como_nos_conocio:'recomendacion'};
 const fields=['franja_horaria','ubicacion_evento','restricciones','como_nos_conocio'];let writes=0,stored;
 const result=await saveFormRecord('oportunidades',original,async payload=>{
  writes++;const absent=fields.find(key=>key in payload);if(absent)return {data:null,error:missing(absent)};
  stored=payload;return {data:null,error:null};
 });
 assert.equal(result.error,null);assert.equal(writes,5);assert.equal(stored.id,'same-id');
 for(const answer of ['Celebración familiar','Franja horaria: Noche','Ubicación del evento: Zaragoza','Restricciones alimentarias o alergias: Sin gluten','Cómo nos conoció: Recomendación de alguien']) assert.ok(stored.mensaje.includes(answer));
 assert.equal(stored.mensaje.match(/Franja horaria:/g).length,1);assert.equal(original.franja_horaria,'noche');
});
test('cliente sin empresa_id: conserva el nombre de empresa y el resto del contacto',async()=>{
 let stored;
 await saveFormRecord('clientes',{empresa_id:null,empresa:'Empresa de prueba',nombre:'Prueba',email:'test@example.com'},async p=>{
 if('empresa_id' in p)return {data:null,error:{code:'42703',message:'column clientes.empresa_id does not exist'}};
 stored=p;return {data:{id:'client'},error:null};
 });assert.equal(stored.empresa,'Empresa de prueba');assert.equal(stored.email,'test@example.com');
});
test('no reintenta ni omite campos ante errores de permisos, red o validación',async()=>{
 for(const error of [{code:'42501',message:'Permission denied'},{code:'',message:'Failed to fetch'},{code:'23505',message:'duplicate key'},{code:'PGRST204',message:"Could not find the 'cliente_id' column"}]){
 let writes=0;const r=await saveFormRecord('oportunidades',{cliente_id:'c'},async()=>{writes++;return {data:null,error}});assert.equal(writes,1);assert.equal(r.error,error);
 }
});
test('esquema actualizado: mantiene las columnas originales sin añadir texto',async()=>{
 const original={mensaje:'Solicitud',restricciones:'Sin gluten'};let stored;
 await saveFormRecord('oportunidades',original,async p=>{stored=p;return {data:null,error:null}});
 assert.deepEqual(stored,original);
});
