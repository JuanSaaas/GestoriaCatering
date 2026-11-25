const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript');
const history={};new Function('exports',ts.transpileModule(fs.readFileSync('lib/webDesignerHistory.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(history);
const draft=name=>({name,document:{schema:1,blocks:[]}});
test('deshacer y rehacer recuperan nombre y contenido sin incluir versiones del servidor',()=>{
 let state=history.initialDraftHistory(draft('Original'));
 state=history.editDraft(state,{name:'Editada',document:{schema:1,blocks:[{id:'nuevo'}]}});
 state=history.undoDraft(state);assert.deepEqual(state.present,draft('Original'));
 state=history.redoDraft(state);assert.equal(state.present.name,'Editada');assert.equal(state.present.document.blocks[0].id,'nuevo');
 assert.equal(state.present.revision,undefined);
});
test('un cambio después de deshacer inicia otra rama y no recupera contenido descartado',()=>{
 let state=history.editDraft(history.initialDraftHistory(draft('A')),draft('B'));
 state=history.undoDraft(state);state=history.editDraft(state,draft('C'));
 assert.equal(state.future.length,0);assert.equal(history.redoDraft(state),state);
 assert.equal(history.undoDraft(state).present.name,'A');
});
test('el historial está acotado, conserva datos anteriores y no registra ediciones idénticas',()=>{
 let state=history.initialDraftHistory(draft('0'));
 const original=state;
 for(let i=1;i<=80;i++)state=history.editDraft(state,draft(String(i)));
 assert.equal(state.past.length,50);assert.equal(state.past[0].name,'30');assert.equal(original.present.name,'0');
 assert.equal(history.editDraft(state,draft('80')),state);
 assert.equal(history.undoDraft(original),original);
});
