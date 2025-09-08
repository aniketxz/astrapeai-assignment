export const config = {
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  PORT: process.env.PORT || 5000
}
