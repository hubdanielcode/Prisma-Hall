/* - 

O QUE ESSA ACTION DEVERIA FAZER? 

1. Descobrir qual usuário está chamando a ação

    - Chama validateSession que valida a sessão pelo cookie
    - Pega o id do usuário por meio da sessão

2. Descobrir qual evento o usuário clicou para comprar

    - Recebe o eventId como parâmetro
    - Valida contra o Schema

3. Exige o login do usuário para efetuar a compra

    - Verifica se o usuário está logado. Se sim, executa o passo 4
    - Caso o usuário não esteja logado, abre o popup de login sem trocar de rota (CRIAR POPUP DE LOGIN)


4. Adiciona o pedido ao carrinho daquele usuário específico

    - Pega o carrinho com base no id do usuário que já temos
    - Chama o handleAddItemsToCart()
    - Valida contra o schema

5. Segue para o fluxo de pagamento (QUE AINDA NÃO EXISTE)

    - Usuário escolhe forma de pagamento
    - Confirma pagamento
    - Usuário recebe email de compra como pendente e, após confirmação de pagamento, recebe email dizendo que a compra foi aprovada
    - Continuar comprando ou redirecionar para /

- */
