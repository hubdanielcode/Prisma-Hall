// O QUE ESSA FUNÇÃO PRECISA FAZER?

import z from "zod";
import { createProductSchema } from "@/lib/validations";
import { checkIsAdmin } from "../checkIsAdmin";

// 1. CHECAR SE A PESSOA QUE TA CHAMANDO É ADMMIN
//         - SIM: RODA NORMAL
//         - NAO: INTERROMPE A FUNÇÃO COM RETURN FALSE

// 2. RECEBER O PRODUTO COMO PARAMETRO TIPADO COMO O QUE FOI VALIDADO NO SCHEMA
//         - Z.INFER<TYPEOF CREATEPRODUCTSCHEMA>
//         - RODAR O SAFEPARSE E DECIDIR O QUE FAZER
//                   - SE FALHAR: INTERROMPE COM RETURN FALSE
//                   - SE PASSAR: SEGUE A FUNÇÃO

// 3. SUBIR O FILE PRO BUCKET DO SUPABASE

//         - PEGAR O FILE VALIDADO PELO PASSO 2 E SUBIR PRO PRODUCT_IMAGES DO SUPABASE
//         - RECEBER O FILE COMO URL PARA USAR NO MOMENTO DA CRIAÇÃO DO PRODUTO
//                   - SE FALHAR: INTERROMPE COM RETURN FALSE
//                   - SE PASSAR: SEGUE A FUNÇÃO

// 4. CRIAR O PRODUTO EM SI
//         - NOME
//         - DESCRIPTION
//         - CATEGORY
//         - IMAGE
//         - PRICE
//         - STATUS

const createProduct = async (product: z.infer<typeof createProductSchema>) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedProduct = createProductSchema.safeParse(product);

  if (!parsedProduct.success) {
    console.log(parsedProduct.error.format);
    return false;
  } else {
    console.log(parsedProduct.data);
  }

  const imageFile = parsedProduct.data.image;
};
