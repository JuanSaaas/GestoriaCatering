const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {PGlite}=require('../tmp/facturas-sql-tests/node_modules/@electric-sql/pglite');

test('Ventas ampliadas: migración, fases, versiones, conservación y permisos en PostgreSQL',async()=>{
 const db=new PGlite();
 try{
  await db.exec('create role anon;create role authenticated;create role service_role bypassrls;create table clientes(id uuid primary key);create table usuarios(id uuid primary key);create table oportunidades(id uuid primary key);');
  await db.exec(fs.readFileSync('supabase/migrations/20261030095202_ventas_documentos.sql','utf8'));
  const cid=crypto.randomUUID(),id=crypto.randomUUID(),pid=crypto.randomUUID();
  await db.query('insert into clientes values($1)',[cid]);
  await db.query(`insert into ventas_documentos(id,cliente_id,cliente_nombre,fecha,lineas,base,iva,total) values($1,$2,'Cliente anterior','2026-11-01','[{"concepto":"Menú","cantidad":1,"precio":100,"impuesto":10,"base":100,"iva":10,"total":110}]',100,10,110)`,[id,cid]);
  await db.exec(fs.readFileSync('supabase/migrations/20261101114544_ventas_catalogo_eventos.sql','utf8'));
  assert.equal((await db.query('select count(*)::int n from ventas_documentos')).rows[0].n,1);
  await db.query(`insert into ventas_productos(id,nombre,precio,impuesto) values($1,'Menú',100,10)`,[pid]);
  let result=await db.query(`update ventas_documentos set estado='enviado',enviado_en=now(),version=1,evento='Boda',validez='2026-12-01' where id=$1 and version=0 and estado='borrador' returning *`,[id]);
  assert.equal(result.rows.length,1);
  assert.equal((await db.query(`update ventas_documentos set version=1 where id=$1 and version=0 returning id`,[id])).rows.length,0);
  await db.query(`update ventas_documentos set tipo='pedido',estado='confirmado',confirmado_en=now(),version=2 where id=$1 and version=1 and estado in ('borrador','enviado')`,[id]);
  assert.equal((await db.query('select count(*)::int n from ventas_documentos')).rows[0].n,1);
  assert.equal((await db.query(`update ventas_documentos set notas='No permitido' where id=$1 and tipo='presupuesto' and estado in ('borrador','enviado') returning id`,[id])).rows.length,0);
  await db.query(`update ventas_productos set archivado=true,version=1 where id=$1 and version=0`,[pid]);
  const doc=(await db.query('select * from ventas_documentos where id=$1',[id])).rows[0];
  assert.equal(doc.lineas[0].precio,100);assert.equal(Number(doc.total),110);
  await db.query(`update ventas_productos set archivado=false,version=2 where id=$1 and version=1`,[pid]);
  await assert.rejects(db.query(`update ventas_documentos set validez='2026-10-01' where id=$1`,[id]),/check constraint/);
  for(const role of ['anon','authenticated']){
   await db.exec(`set role ${role}`);
   await assert.rejects(db.query('select * from ventas_productos'),/permission denied/);
   await assert.rejects(db.query('select * from ventas_documentos'),/permission denied/);
   await db.exec('reset role');
  }
  await db.exec('set role service_role');
  assert.equal((await db.query('select count(*)::int n from ventas_productos')).rows[0].n,1);
 }finally{await db.close();}
});
