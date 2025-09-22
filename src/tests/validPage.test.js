import { test, assert, describe, beforeEach, afterEach} from 'poku'


describe('TESTES DE PÁGINAS VÁLIDAS',{background:'cyan'})

await test('Retorna página válida do fórum',async ()=>{
    const url = `http://localhost:3000/forum-substituto.html`
    const resp = await fetch(url)
    assert.strictEqual(resp.status,200,"response status 200")
})

await test('Retorna página válida de novo post',async ()=>{
    const url = `http://localhost:3000/forum-postar.html#`
    const resp = await fetch(url)
    assert.strictEqual(resp.status,200,"response status 200")
})

//await test('Pagina inválida de clientes',async ()=>{
//    const url = `http://localhost:3000/admin/clientesPage?page=a`
//    const resp = await fetch(url)
//    assert.strictEqual(resp.status,400,"response status 400")
//    const data = await resp.json()
//    assert.deepStrictEqual(data,{erro:true,message:'página inválida!'},"erro retornado com sucesso")
//})

