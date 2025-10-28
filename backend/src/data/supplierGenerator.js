// Generate synthetic supplier data for origination
export function generateSuppliers(count = 1247) {
  const suppliers = []
  const regions = ['Asia-Pacific', 'Europe', 'North America', 'Latin America', 'Africa', 'Middle East']
  const industries = ['Manufacturing', 'Technology', 'Agriculture', 'Energy', 'Healthcare', 'Financial Services', 'Retail', 'Construction']
  const countries = {
    'Asia-Pacific': ['SG', 'HK', 'CN', 'JP', 'KR', 'TH', 'MY', 'ID', 'PH', 'VN'],
    'Europe': ['DE', 'FR', 'GB', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'SE'],
    'North America': ['US', 'CA', 'MX'],
    'Latin America': ['BR', 'AR', 'CL', 'CO', 'PE', 'UY'],
    'Africa': ['ZA', 'NG', 'EG', 'KE', 'MA', 'GH'],
    'Middle East': ['AE', 'SA', 'IL', 'TR', 'QA', 'KW']
  }

  for (let i = 1; i <= count; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)]
    const industry = industries[Math.floor(Math.random() * industries.length)]
    const country = countries[region][Math.floor(Math.random() * countries[region].length)]
    
    const supplier = {
      id: `supplier-${i.toString().padStart(4, '0')}`,
      name: generateSupplierName(industry, i),
      region,
      country,
      industry,
      yearsInBusiness: Math.floor(Math.random() * 20) + 1,
      employeeCount: Math.floor(Math.random() * 500) + 10,
      creditRating: generateCreditRating(),
      predictedVolume: generatePredictedVolume(industry, region),
      aiScore: generateAIScore(),
      lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: generateStatus(),
      contactInfo: {
        email: `contact${i}@supplier${i}.com`,
        phone: generatePhoneNumber(country),
        website: `https://supplier${i}.com`
      },
      businessInfo: {
        legalName: generateLegalName(industry, i),
        taxId: generateTaxId(country),
        registrationDate: generateRegistrationDate(),
        businessType: generateBusinessType()
      },
      financialInfo: {
        annualRevenue: generateAnnualRevenue(industry),
        profitMargin: generateProfitMargin(industry),
        debtToEquity: generateDebtToEquity(),
        currentRatio: generateCurrentRatio()
      },
      compliance: {
        kycStatus: generateKYCStatus(),
        amlStatus: generateAMLStatus(),
        uboStatus: generateUBOStatus(),
        lastVerified: generateLastVerified()
      },
      tradeHistory: {
        totalTransactions: Math.floor(Math.random() * 100) + 10,
        averageTransactionSize: generateAverageTransactionSize(industry),
        paymentHistory: generatePaymentHistory(),
        defaultRate: generateDefaultRate()
      }
    }
    
    suppliers.push(supplier)
  }
  
  return suppliers
}

function generateSupplierName(industry, index) {
  const prefixes = ['Global', 'International', 'Advanced', 'Premium', 'Elite', 'Superior', 'Dynamic', 'Innovative']
  const suffixes = ['Ltd', 'Corp', 'Inc', 'Group', 'Holdings', 'Enterprises', 'Solutions', 'Systems']
  const industryTerms = {
    'Manufacturing': ['Manufacturing', 'Industries', 'Production', 'Fabrication'],
    'Technology': ['Technologies', 'Systems', 'Solutions', 'Innovations'],
    'Agriculture': ['Agriculture', 'Farming', 'Agri', 'Crops'],
    'Energy': ['Energy', 'Power', 'Utilities', 'Resources'],
    'Healthcare': ['Healthcare', 'Medical', 'Pharma', 'Biotech'],
    'Financial Services': ['Finance', 'Capital', 'Investments', 'Banking'],
    'Retail': ['Retail', 'Commerce', 'Trading', 'Merchandise'],
    'Construction': ['Construction', 'Building', 'Engineering', 'Contractors']
  }
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const industryTerm = industryTerms[industry][Math.floor(Math.random() * industryTerms[industry].length)]
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
  
  return `${prefix} ${industryTerm} ${suffix}`
}

function generateCreditRating() {
  const ratings = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-', 'BB+', 'BB', 'BB-', 'B+', 'B', 'B-']
  const weights = [0.02, 0.03, 0.05, 0.08, 0.10, 0.12, 0.15, 0.15, 0.12, 0.08, 0.05, 0.03, 0.02, 0.01, 0.01, 0.01]
  
  const random = Math.random()
  let cumulative = 0
  
  for (let i = 0; i < ratings.length; i++) {
    cumulative += weights[i]
    if (random <= cumulative) {
      return ratings[i]
    }
  }
  
  return 'BBB'
}

function generatePredictedVolume(industry, region) {
  const baseVolumes = {
    'Manufacturing': 2000000,
    'Technology': 1500000,
    'Agriculture': 1000000,
    'Energy': 3000000,
    'Healthcare': 1200000,
    'Financial Services': 800000,
    'Retail': 600000,
    'Construction': 1800000
  }
  
  const regionMultipliers = {
    'Asia-Pacific': 1.2,
    'Europe': 1.0,
    'North America': 1.1,
    'Latin America': 0.8,
    'Africa': 0.6,
    'Middle East': 0.9
  }
  
  const baseVolume = baseVolumes[industry] || 1000000
  const multiplier = regionMultipliers[region] || 1.0
  const variation = 0.5 + Math.random() * 1.0 // 0.5x to 1.5x
  
  return Math.round(baseVolume * multiplier * variation)
}

function generateAIScore() {
  // Generate AI score with some correlation to other factors
  return Math.floor(Math.random() * 40) + 60 // 60-100
}

function generateStatus() {
  const statuses = ['active', 'pending', 'suspended', 'inactive']
  const weights = [0.7, 0.15, 0.1, 0.05]
  
  const random = Math.random()
  let cumulative = 0
  
  for (let i = 0; i < statuses.length; i++) {
    cumulative += weights[i]
    if (random <= cumulative) {
      return statuses[i]
    }
  }
  
  return 'active'
}

function generatePhoneNumber(country) {
  const countryCodes = {
    'SG': '+65', 'HK': '+852', 'CN': '+86', 'JP': '+81', 'KR': '+82',
    'DE': '+49', 'FR': '+33', 'GB': '+44', 'IT': '+39', 'ES': '+34',
    'US': '+1', 'CA': '+1', 'MX': '+52',
    'BR': '+55', 'AR': '+54', 'CL': '+56', 'CO': '+57',
    'AE': '+971', 'SA': '+966', 'IL': '+972', 'TR': '+90'
  }
  
  const code = countryCodes[country] || '+1'
  const number = Math.floor(Math.random() * 90000000) + 10000000
  return `${code} ${number}`
}

function generateLegalName(industry, index) {
  return generateSupplierName(industry, index)
}

function generateTaxId(country) {
  const prefixes = {
    'SG': 'SG', 'HK': 'HK', 'CN': 'CN', 'JP': 'JP', 'KR': 'KR',
    'DE': 'DE', 'FR': 'FR', 'GB': 'GB', 'IT': 'IT', 'ES': 'ES',
    'US': 'US', 'CA': 'CA', 'MX': 'MX',
    'BR': 'BR', 'AR': 'AR', 'CL': 'CL', 'CO': 'CO',
    'AE': 'AE', 'SA': 'SA', 'IL': 'IL', 'TR': 'TR'
  }
  
  const prefix = prefixes[country] || 'XX'
  const number = Math.floor(Math.random() * 900000000) + 100000000
  return `${prefix}${number}`
}

function generateRegistrationDate() {
  const now = new Date()
  const yearsAgo = Math.floor(Math.random() * 20) + 1
  const date = new Date(now.getFullYear() - yearsAgo, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
  return date.toISOString().split('T')[0]
}

function generateBusinessType() {
  const types = ['Corporation', 'LLC', 'Partnership', 'Sole Proprietorship', 'Limited Partnership']
  return types[Math.floor(Math.random() * types.length)]
}

function generateAnnualRevenue(industry) {
  const baseRevenues = {
    'Manufacturing': 50000000,
    'Technology': 30000000,
    'Agriculture': 20000000,
    'Energy': 80000000,
    'Healthcare': 40000000,
    'Financial Services': 60000000,
    'Retail': 15000000,
    'Construction': 35000000
  }
  
  const base = baseRevenues[industry] || 25000000
  const variation = 0.5 + Math.random() * 1.5 // 0.5x to 2x
  return Math.round(base * variation)
}

function generateProfitMargin(industry) {
  const margins = {
    'Manufacturing': 0.08,
    'Technology': 0.15,
    'Agriculture': 0.05,
    'Energy': 0.12,
    'Healthcare': 0.18,
    'Financial Services': 0.20,
    'Retail': 0.06,
    'Construction': 0.10
  }
  
  const base = margins[industry] || 0.10
  const variation = 0.5 + Math.random() * 1.0 // 0.5x to 1.5x
  return Math.round(base * variation * 100) / 100
}

function generateDebtToEquity() {
  return Math.round((0.2 + Math.random() * 0.8) * 100) / 100 // 0.2 to 1.0
}

function generateCurrentRatio() {
  return Math.round((1.0 + Math.random() * 1.5) * 100) / 100 // 1.0 to 2.5
}

function generateKYCStatus() {
  const statuses = ['PASSED', 'PENDING', 'REVIEW_REQUIRED', 'FAILED']
  const weights = [0.85, 0.10, 0.04, 0.01]
  return getWeightedRandom(statuses, weights)
}

function generateAMLStatus() {
  const statuses = ['PASSED', 'PENDING', 'REVIEW_REQUIRED', 'FAILED']
  const weights = [0.92, 0.05, 0.02, 0.01]
  return getWeightedRandom(statuses, weights)
}

function generateUBOStatus() {
  const statuses = ['PASSED', 'PENDING', 'REVIEW_REQUIRED', 'FAILED']
  const weights = [0.89, 0.08, 0.02, 0.01]
  return getWeightedRandom(statuses, weights)
}

function generateLastVerified() {
  const daysAgo = Math.floor(Math.random() * 90) + 1 // 1 to 90 days ago
  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
  return date.toISOString()
}

function generateAverageTransactionSize(industry) {
  const baseSizes = {
    'Manufacturing': 500000,
    'Technology': 300000,
    'Agriculture': 200000,
    'Energy': 800000,
    'Healthcare': 400000,
    'Financial Services': 600000,
    'Retail': 100000,
    'Construction': 350000
  }
  
  const base = baseSizes[industry] || 250000
  const variation = 0.5 + Math.random() * 1.5 // 0.5x to 2x
  return Math.round(base * variation)
}

function generatePaymentHistory() {
  return Math.round((0.7 + Math.random() * 0.3) * 100) / 100 // 0.7 to 1.0
}

function generateDefaultRate() {
  return Math.round((Math.random() * 0.05) * 1000) / 1000 // 0 to 5%
}

function getWeightedRandom(items, weights) {
  const random = Math.random()
  let cumulative = 0
  
  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i]
    if (random <= cumulative) {
      return items[i]
    }
  }
  
  return items[0]
}
