

/**
 * Calcula famílias beneficiadas baseado nos itens
 */
const calculateFamiliesHelped = (items) => {
  const foodItems = items.filter(i => i.category === 'alimento' || i.category === 'roupa');
  if (foodItems.length === 0) return 0;
  
  const totalFoodUnits = foodItems.reduce((sum, item) => sum + item.quantity, 0);
  return Math.floor(totalFoodUnits / 5); // 1 família = 5 itens de comida
};

/**
 * Calcula redução de CO2 em kg
 */
const calculateCO2Reduction = (items) => {
  const co2Values = {
    clothing: 2.5, // kg CO2 por peça
    food: 0.3,     // kg CO2 por item
    hygiene: 0.8   // kg CO2 por item
  };

  return items.reduce((sum, item) => {
    return sum + (co2Values[item.category] || 0) * item.quantity;
  }, 0).toFixed(2);
};

/**
 * Determina método de descarte apropriado
 */
const determineDisposalMethod = (items) => {
  const hasHazardous = items.some(i => i.category === 'hygiene' && i.type === 'medical');
  return hasHazardous ? 'Incineration' : 'Reciclagem';
};

/**
 * Simula upload de comprovante
 */
const uploadDeliveryProof = async (donationId) => {
  return {
    url: `https://storage.googleapis.com/delivery-proofs/${donationId}.jpg`,
    uploadedAt: new Date().toISOString(),
    verified: false
  };
};


module.exports = {
uploadDeliveryProof,
determineDisposalMethod,
calculateCO2Reduction,
determineDisposalMethod,
calculateFamiliesHelped,
};