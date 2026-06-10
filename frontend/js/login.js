async function login(){

 const email =
 document.getElementById('email').value;

 const senha =
 document.getElementById('senha').value;

 if(!email || !senha){
   alert('Por favor, preencha email e senha!');
   return;
 }

 try {
   const response =
   await fetch(
   'http://localhost:3000/auth/login',
   {
     method:'POST',
     headers:{
      'Content-Type':'application/json'
     },
     body:JSON.stringify({
        email,
        senha
     })
   });

   const data =
   await response.json();

   if(!response.ok){
     alert('❌ Erro: ' + (data.msg || 'Email ou senha incorretos'));
     return;
   }

   if(!data.token){
     alert('❌ Erro: Token não recebido do servidor');
     return;
   }

   localStorage.setItem(
     'token',
     data.token
   );

   localStorage.setItem(
     'usuario',
     JSON.stringify(data)
   );

   console.log('Login realizado! Token salvo.');

   alert('✅ Login realizado com sucesso!');

   window.location =
   'cadastroproduto.html';

 } catch(err){
   console.error('Erro ao fazer login:', err);
   alert('❌ Erro ao fazer login: ' + err.message);
 }

}