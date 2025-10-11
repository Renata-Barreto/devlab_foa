import { test, assert, describe } from 'poku';
import fetch from 'node-fetch';

describe('TESTE DO FÓRUM', {background: 'purple'})

const API_BASE = 'http://localhost:3000/api/forum/posts';

await test('GET /posts retorna objeto com paginação e registros', async () => {
  const response = await fetch(`${API_BASE}`);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.ok(typeof data === 'object', 'O retorno deve ser um objeto');
  
  const postsKey = Object.keys(data).find(key => 
    Array.isArray(data[key]) && key !== 'pagination'
  );
  
  assert.ok(postsKey, `Deve conter uma chave com array de posts`);
  assert.ok(Array.isArray(data[postsKey]), `A chave ${postsKey} deve ser um array`);
  
  // Verifica a estrutura
  assert.ok('pagination' in data, 'Deve conter a chave pagination');
  assert.ok(typeof data.pagination === 'object', 'pagination deve ser um objeto');
  assert.ok('page' in data.pagination, 'pagination deve conter page');
  assert.ok('limit' in data.pagination, 'pagination deve conter limit');
  assert.ok('total' in data.pagination, 'pagination deve conter total');
  assert.ok('totalPages' in data.pagination, 'pagination deve conter totalPages');
  
  // Verifica se retorna a quantidade esperada de registros
  const expectedLimit = data.pagination.limit;
  assert.strictEqual(
    data[postsKey].length, 
    expectedLimit, 
    `Deve retornar 10 registros por página`
  );
});