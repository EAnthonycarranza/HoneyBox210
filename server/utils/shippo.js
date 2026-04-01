const { Shippo } = require('shippo');

const shippo = new Shippo({
  apiKeyHeader: process.env.SHIPPO_API_KEY,
});

/**
 * Create a shipment and get rates
 * @param {Object} addressTo - Recipient address
 * @param {Array} lineItems - List of items in the shipment
 * @returns {Promise<Object>} - Shippo shipment object with rates
 */
const createShipment = async (addressTo, lineItems) => {
  // Default sender address (Honey Box 210)
  const addressFrom = {
    name: 'Honey Box 210',
    street1: 'North San Antonio',
    city: 'San Antonio',
    state: 'TX',
    zip: '78212',
    country: 'US',
    phone: '2105550123',
    email: 'info@honeybox210.com'
  };

  // Estimate parcel size/weight based on items
  let totalWeight = 0;
  lineItems.forEach(item => {
    const weightStr = item.weight || '12oz';
    const weightMatch = weightStr.match(/(\d+)/);
    const weight = weightMatch ? parseInt(weightMatch[1]) : 12;
    totalWeight += weight * (item.quantity || 1);
  });

  const parcel = {
    length: '10',
    width: '10',
    height: '10',
    distanceUnit: 'in',
    weight: totalWeight.toString(),
    massUnit: 'oz',
  };

  try {
    const shipment = await shippo.shipments.create({
      addressFrom: addressFrom,
      addressTo: addressTo,
      parcels: [parcel],
      async: false,
    });

    return shipment;
  } catch (error) {
    console.error('Shippo Shipment Error:', error.message);
    throw error;
  }
};

/**
 * Purchase a shipping label
 * @param {string} rateId - The ID of the rate to purchase
 * @returns {Promise<Object>} - Shippo transaction object
 */
const purchaseLabel = async (rateId) => {
  try {
    const transaction = await shippo.transactions.create({
      rate: rateId,
      labelFileType: 'PDF',
      async: false,
    });

    return transaction;
  } catch (error) {
    console.error('Shippo Transaction Error:', error.message);
    throw error;
  }
};

/**
 * Validate an address using Shippo
 * @param {Object} address - Address to validate
 * @returns {Promise<Object>} - Validation result
 */
const validateAddress = async (address) => {
  try {
    const validatedAddress = await shippo.addresses.create({
      ...address,
      validate: true,
    });

    return validatedAddress;
  } catch (error) {
    console.error('Shippo Address Validation Error:', error.message);
    throw error;
  }
};

module.exports = {
  createShipment,
  purchaseLabel,
  validateAddress,
};
