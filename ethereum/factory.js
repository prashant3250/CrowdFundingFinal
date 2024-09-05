
import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  '0x1F438f0fC1944208eBF5974e8F08c2ae4c11f620'
);

export default instance;

