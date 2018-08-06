/* eslint-disable no-undef,prefer-arrow-callback */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { join } = require('path');
const { readFileSync } = require('fs');
const { configure } = require('../.');

chai.use(chaiAsPromised);

const expect = chai.expect;
const results = JSON.parse(readFileSync(join(__dirname, 'results.json')));

describe('search', function () {
  const { search } = configure({
    proxy: {
      host: process.env.PROXY_HOST,
      port: process.env.PROXY_PORT,
    }
  });

  /** Success tests * */
  Object.keys(results).forEach(function (plate) {
    it(`Success: ${plate}`, async function () {
      this.timeout(5000);
      const vehicle = await search(plate);

      return expect(vehicle)
        .to.deep.include(results[plate])
        .to.contain.keys('data', 'dataAtualizacaoAlarme', 'dataAtualizacaoRouboFurto', 'dataAtualizacaoCaracteristicasVeiculo');
    });
  });

  it('Fail: no parameter provided', async () => expect(search()).to.be.rejectedWith('Formato de placa inválido! Utilize o formato "AAA9999" ou "AAA-9999".'));
  it('Fail: empty plate', async () => expect(search('')).to.be.rejectedWith('Formato de placa inválido! Utilize o formato "AAA9999" ou "AAA-9999".'));
  it('Fail: bad format', async () => expect(search('AAAAAAA')).to.be.rejectedWith('Formato de placa inválido! Utilize o formato "AAA9999" ou "AAA-9999".'));
  it('Fail: not found', async () => expect(search('ZZZ9999')).to.be.rejectedWith('Veículo não encontrado'));

  const { search: searchWithProxy } = configure({
    proxy: {
      host: '177.184.144.130',
      port: '8080',
    }
  });

  /** Success (With Proxy) tests * */
  Object.keys(results).forEach(function (plate) {
    it(`Success (With Proxy): ${plate}`, async function () {
      this.timeout(5000);
      const vehicle = await searchWithProxy(plate);

      return expect(vehicle)
        .to.deep.include(results[plate])
        .to.contain.keys('data', 'dataAtualizacaoAlarme', 'dataAtualizacaoRouboFurto', 'dataAtualizacaoCaracteristicasVeiculo');
    });
  });

  it('Fail (With Proxy): not found', async () => expect(searchWithProxy('ZZZ9999')).to.be.rejectedWith('Veículo não encontrado'));
});
