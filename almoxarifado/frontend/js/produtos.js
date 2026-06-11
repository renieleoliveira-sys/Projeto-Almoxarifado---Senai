async function carregar(){

 const token =
 localStorage.getItem('token');

 if(!token){
   alert('Erro: Nenhum token encontrado. Faça login novamente!');
   window.location = 'login.html';
   return;
 }

 try{
   const response =
   await fetch(
   'http://localhost:3000/produtos',
   {
    headers:{
     authorization:token
    }
   });

   if(!response.ok){
     alert('Erro ao carregar produtos: ' + response.status);
     return;
   }

   const produtos =
   await response.json();

   if(!Array.isArray(produtos)){
     console.error('Produtos não é um array:', produtos);
     alert('Erro ao carregar produtos');
     return;
   }

   let html='';

   if(produtos.length === 0){
     html = '<tr><td colspan="4">Nenhum produto cadastrado</td></tr>';
   } else {
     produtos.forEach(p=>{
       html+=`
       <tr>
       <td>${p.id}</td>
       <td>${p.nome}</td>
       <td>${p.quantidade}</td>
       <td><button class="btn btn-danger btn-sm" onclick="deletarProduto(${p.id})">Deletar</button></td>
       </tr>
       `;
     });
   }

   document
   .getElementById('lista')
   .innerHTML = html;

 } catch(err){
   console.error('Erro:', err);
   alert('Erro ao carregar produtos: ' + err.message);
 }

}

async function deletarProduto(id){
  if(!confirm('Tem certeza que deseja deletar este produto?')){
    return;
  }

  try {
    const token = localStorage.getItem('token');

    console.log('Deletando produto ID:', id);
    console.log('Token:', token);

    const response = await fetch(
      'http://localhost:3000/produtos/' + id,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          authorization: token
        }
      }
    );

    console.log('Status:', response.status);

    const data = await response.json();

    console.log('Resposta:', data);

    if(!response.ok){
      alert('Erro: ' + (data.msg || 'Erro ao deletar'));
      return;
    }

    alert('Produto deletado com sucesso!');
    carregar();

  } catch(err){
    console.error('Erro ao deletar:', err);
    alert('Erro ao deletar: ' + err.message);
  }
}

carregar();