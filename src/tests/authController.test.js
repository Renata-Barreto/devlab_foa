import { test, assert, describe } from 'poku'
import { login } from '../controllers/auth.controller.js'

describe('TESTE DE LOGIN', { background: 'purple'})

function mockRes() {
  const res = {}
  res.statusCode = null
  res.body = null
  res.status = function (code) { this.statusCode = code; return this }
  res.json = function (body) { this.body = body; return this }
  return res
}

test('returns 400 if email or password missing', async () => {
  const req = { body: { email: '', password: '' } }
  const res = mockRes()
  await login(req, res)
  assert.strictEqual(res.statusCode, 400)
  assert.deepStrictEqual(res.body, { error: "E-mail e senha são obrigatórios" })
})

test('returns 404 if user not found', async () => {
  const req = { body: { email: 'naoexiste@teste.com', password: '123' } }
  const res = mockRes()
  await login(req, res)
  assert.strictEqual(res.statusCode, 404)
  assert.deepStrictEqual(res.body, { error: "Usuário não encontrado ou inativo" })
})

test('returns 401 if password incorrect', async () => {
  const req = { body: { email: 're@gmail.com', password: 'Lalala1234' } }
  const res = mockRes()
  await login(req, res)
  assert.strictEqual(res.statusCode, 401)
  assert.deepStrictEqual(res.body, { error: "Senha incorreta"})
})

test('returns 200 and token for correct login', async () => {
  const req = { body: { email: 're@gmail.com', password: 'Lalala123*' } }
  const res = mockRes()
  await login(req, res)
  assert.strictEqual(res.statusCode, 200)
  assert.ok(res.body.token)
  assert.ok(res.body.userTipo)
})