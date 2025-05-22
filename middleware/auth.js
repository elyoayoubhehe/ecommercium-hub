const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    console.log('Auth middleware called for', req.method, req.originalUrl);
    
    // Extract the Authorization header
    const authHeader = req.header('Authorization');
    
    // Log the first part of the token for debugging
    if (authHeader) {
      console.log('Authorization header found:', authHeader.substring(0, 20) + '...');
    } else {
      console.log('No Authorization header found');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Extract the token from the Bearer format
    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted, length:', token.length);
    
    try {
      // Verify the token
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error('JWT_SECRET not defined in environment!');
        return res.status(500).json({ message: 'Server configuration error' });
      }
      
      console.log('Verifying token with secret:', secret.substring(0, 5) + '...');
      const decoded = jwt.verify(token, secret);
      
      console.log('Token verified successfully for user:', decoded.email, 'role:', decoded.role);
      req.user = decoded;
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth; 