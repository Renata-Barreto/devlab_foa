import { test, assert, describe } from 'poku'


describe('TESTES DE PÁGINAS VÁLIDAS',{background:'cyan'})

await test('Retorna página válida do fórum',async ()=>{
    const url = `http://localhost:3000/forum-substituto.html`
    const resp = await fetch(url)
    assert.strictEqual(resp.status,200,"response status 200")
})

await test('Retorna página válida de novo post',async ()=>{
    const url = `http://localhost:3000/forum-postar.html`
    const resp = await fetch(url)
    assert.strictEqual(resp.status,200,"response status 200")
})

await test('Página válida de contato',async ()=>{
    const url = `http://localhost:3000/contato.html`
    const resp = await fetch(url)
    assert.strictEqual(resp.status,200,"response status 200")
})

