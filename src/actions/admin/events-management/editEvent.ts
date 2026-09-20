/*
  
  - O QUE ESSA SERVER ACTION DEVERIA FAZER? 
  
  // 1. Verificar se quem está chamando a ação tem a role de admin

      - if (!isAdmin) => Interrompe a função com um belíssimo return false
      - if (isAdmin) => Segue a função com um singelo return true
  
  // 2. Valida o evento a ser editado contra o schema e roda o safeParse

  // 3. Criar um objeto base para o evento padrão com os campos obrigatórios
  
      - const baseEventData = {campos obrigatórios do evento já com os valores validados (parsedEvent.data.value)}
      - cria um imageFile separado para guardar a possivel imagem (já que não é obrigatório)

  // 4. Como aceita edit parcial, precisa verificar se veio alguma imagem nessa edição

    - Se houver troca de imagem: {
                                   - Valida a imagem contra o schema: {
                                                                        - Se passar => Segue a função normalmente com return true
                                                                        - Se falhar => Interrompe a função e não aceita a imagem com return false
                                                                      }
                                   - Sobe a imagem no vercel: const blob = await put(`${Date.now()}-${imageFile.name}`, imageFile, { access: "public" });  
                                   - Forma o editedEvent (objeto novo com os campos editados)  
                                 }
    
    - Se não houver troca de imagem, forma o editedEvent (objeto novo com os campos editados)
  
  - */
