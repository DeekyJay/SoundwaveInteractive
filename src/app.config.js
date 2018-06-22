const DEV_API_PATH = 'http://localhost:3000/'
const PROD_API_PATH = 'http://localhost:3000/'
const API_BASE_URL =  process.env.NODE_ENV === 'development' ? DEV_API_PATH : PROD_API_PATH
export default {'API_BASE_URL': API_BASE_URL};