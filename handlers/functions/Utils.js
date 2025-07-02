const parseAmountInput = (input) => {
    const cleanedInput = input.replace(/\s+/g, '');
    
    const match = cleanedInput.match(/^(\d+)([KkMmTt]?)$/);
    if (!match) return null;
    
    const [, numStr, suffix] = match;
    const num = parseFloat(numStr);
    
    if (isNaN(num)) return null;
    
    switch ((suffix || '').toUpperCase()) {
        case 'K': return num * 1000;
        case 'M': return num * 1000000;
        case 'T': return num * 1000000000;
        default: return num;
    }
};

function formatMoney(amount) {
    return new Intl.NumberFormat('fr-FR', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
    }).format(amount);
}

function generateRandomUUID() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
  
    return result;
}

const Utils = {
    parseAmountInput,
    formatMoney,
    generateRandomUUID
};

module.exports = Utils;