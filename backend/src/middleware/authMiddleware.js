const jwt = require('jsonwebtoken');

exports.authenticateJWT = (req, res, next) => {
  const token = req.cookies.accessToken || req.headers['authorization']?.split(' ')[1];
  
  console.log('🔐 JWT authentication attempt:', { 
    hasCookie: !!req.cookies.accessToken, 
    hasHeader: !!req.headers['authorization'],
    tokenLength: token ? token.length : 0 
  });
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('❌ JWT verification failed:', err.message);
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    console.log('✅ JWT verified successfully:', { 
      userId: decoded.id, 
      userName: decoded.name, 
      userRole: decoded.role 
    });
    
    req.user = decoded;
    next();
  });
};

exports.authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }
  
  next();
}; 