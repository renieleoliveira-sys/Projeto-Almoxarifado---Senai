const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'segredo';

module.exports = (req,res,next)=>{

 let token = req.headers.authorization;

 if(!token){
   return res.status(401).json({msg:'Sem token'});
 }

 // Remove "Bearer " se estiver presente
 if(token.startsWith('Bearer ')){
   token = token.slice(7);
 }

 try{

   const decoded = jwt.verify(
      token,
      JWT_SECRET
   );

   req.user = decoded;

   next();

 }catch(err){
   console.log('Erro ao verificar token:', err.message);
   res.status(401).json({
      msg:'Token inválido'
   });
 }

};