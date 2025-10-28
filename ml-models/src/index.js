// ML Models entry point
export { CreditRiskModel } from './creditRisk/model.js'
export { LeadScoringModel } from './leadScoring/lstmModel.js'
export { FraudDetector } from './fraud/anomalyDetector.js'

console.log('🤖 Vabble ML Models loaded successfully')
console.log('📊 Available models:')
console.log('  - Credit Risk Model (92% AUC-ROC)')
console.log('  - Lead Scoring Model (LSTM-based)')
console.log('  - Fraud Detector (Isolation Forest)')
