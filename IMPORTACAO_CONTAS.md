# 📥 Guia de Importação de Contas a Pagar

## Como Usar

### 1. Acessar o Django Admin
1. Acesse: `http://localhost/admin/`
2. Faça login com suas credenciais
3. Vá para **Financeiro → Contas a Pagar**

### 2. Baixar Modelo CSV
1. No topo da lista de contas, clique em **"Baixar Modelo CSV"**
2. Um arquivo `modelo_contas_pagar.csv` será baixado
3. Abra o arquivo no Excel ou LibreOffice

### 3. Preencher o CSV

#### Campos Obrigatórios:
- **descricao**: Descrição da conta
- **data_vencimento**: Data no formato `YYYY-MM-DD` (ex: 2025-01-15)
- **valor_original**: Valor numérico (ex: 1000.00)

#### Campos Opcionais:
- **filial_nome**: Nome da filial (deve estar cadastrada)
- **fornecedor_nome**: Nome do fornecedor (deve estar cadastrado)
- **categoria_nome**: Nome da categoria (deve estar cadastrada)
- **desconto**: Valor de desconto
- **juros**: Valor de juros
- **multa**: Valor de multa
- **data_emissao**: Data de emissão
- **forma_pagamento_nome**: Nome da forma de pagamento
- **status**: pendente | paga | vencida | cancelada (padrão: pendente)
- **numero_boleto**: Número do boleto
- **notas_fiscais**: Número da nota fiscal
- **observacoes**: Observações gerais

### 4. Exemplo de CSV

```csv
descricao,filial_nome,fornecedor_nome,categoria_nome,valor_original,desconto,juros,multa,data_emissao,data_vencimento,forma_pagamento_nome,status,numero_boleto,notas_fiscais,observacoes
Pagamento de Luz,Matriz,CEMIG,Despesas Operacionais,850.50,0,0,0,2025-01-01,2025-01-15,Boleto,pendente,12345,NF-001,Conta de janeiro
Aluguel,Matriz,Imobiliária XYZ,Aluguel,5000.00,0,0,0,2025-01-01,2025-01-05,Transferência,pendente,,NF-002,
```

### 5. Importar

1. Clique em **"Importar Contas"**
2. Selecione seu arquivo CSV preenchido
3. Clique em **"Importar"**
4. Aguarde o processamento

### 6. Resultado

Após a importação, você verá:
- ✅ **Sucessos**: Quantas contas foram importadas
- ⚠️ **Erros**: Lista de erros encontrados com número da linha

## ⚠️ Dicas Importantes

### Preparação Prévia
Antes de importar, certifique-se de cadastrar:
1. **Filiais** que serão usadas
2. **Fornecedores** que serão referenciados
3. **Categorias Financeiras** necessárias
4. **Formas de Pagamento** (opcional)

### Formato de Dados
- **Datas**: Use `YYYY-MM-DD` (ex: 2025-01-15)
- **Valores**: Use ponto ou vírgula como decimal (1000.00 ou 1000,00)
- **Nomes**: Devem corresponder exatamente aos cadastrados (case-insensitive)
- **Encoding**: Salve o CSV como UTF-8

### Excel / LibreOffice
- Ao salvar no Excel, escolha **"CSV UTF-8 (delimitado por vírgula)"**
- No LibreOffice Calc, ao salvar escolha **"CSV UTF-8"**

### Tratamento de Erros
Se houver erros:
- A importação **continua** para as linhas válidas
- Linhas com erro são **ignoradas**
- Um relatório detalhado é exibido
- Corrija os erros e importe novamente

## 🔧 Troubleshooting

### "Filial não encontrada"
- Verifique se a filial está cadastrada
- Confira se o nome está escrito corretamente
- Os nomes não são case-sensitive

### "Fornecedor não encontrado"
- Cadastre o fornecedor primeiro em **Financeiro → Fornecedores**
- Verifique a ortografia

### "Erro ao converter data"
- Use o formato `YYYY-MM-DD`
- Exemplo correto: `2025-01-15`
- Exemplo incorreto: `15/01/2025` ou `01-15-2025`

### "Erro ao converter valor"
- Use apenas números e ponto/vírgula decimal
- Exemplo correto: `1000.50` ou `1000,50`
- Exemplo incorreto: `R$ 1.000,50` ou `1.000,50`

## 📊 Exportando do Sistema Antigo

Se você está migrando de outro sistema:

1. Exporte os dados do sistema antigo em formato CSV ou Excel
2. Ajuste as colunas para corresponder ao modelo fornecido
3. Converta datas e valores para o formato correto
4. Faça a importação em lotes pequenos (100-200 linhas) primeiro para testar
5. Após validar, importe o restante

## 🚀 Exemplo Completo

```csv
descricao,filial_nome,fornecedor_nome,categoria_nome,valor_original,desconto,juros,multa,data_emissao,data_vencimento,forma_pagamento_nome,status,numero_boleto,notas_fiscais,observacoes
Conta de Luz - Janeiro 2025,Filial Principal,Companhia Elétrica,Despesas Operacionais,450.80,0,0,0,2025-01-05,2025-01-20,Boleto,pendente,789456123,NF-2025001,Vencimento dia 20
Material de Escritório,Filial Principal,Papelaria Central,Material de Consumo,320.00,32.00,0,0,2025-01-03,2025-01-30,Cartão,pendente,,NF-543,Desconto de 10%
Internet - Plano Empresarial,Filial Principal,Telecom Brasil,Serviços de TI,299.90,0,0,0,2025-01-01,2025-01-10,Débito Automático,paga,,NF-789,Pago via débito automático
```

---

**Desenvolvido com Django Admin**
