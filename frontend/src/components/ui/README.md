# 📦 Componentes UI - Untitled UI

Esta pasta contém todos os componentes UI do projeto baseados no **Untitled UI**.

## 🎯 Como Adicionar Componentes

### Método 1: Copiar do Site (Recomendado)

1. Acesse: https://www.untitledui.com/react/components
2. Escolha o componente que precisa (Button, Input, Select, etc)
3. Copie o código do componente
4. Cole em um novo arquivo nesta pasta
5. Adicione a exportação no `index.js`

**Exemplo:**
```bash
# Criar arquivo do componente
frontend/src/components/ui/button.jsx

# Adicionar exportação no index.js:
export { Button } from './button'
```

### Método 2: Usando CLI (Se funcionar)

```bash
# No terminal do seu computador (não no Docker)
cd frontend
npx untitledui@latest add button
```

**⚠️ Nota:** A CLI pode não funcionar com o setup atual, então use o Método 1.

## 📋 Componentes Disponíveis

Marque os componentes que você já adicionou:

### Formulários
- [ ] Button
- [ ] Input
- [ ] Textarea
- [ ] Select
- [ ] Checkbox
- [ ] Radio Group
- [ ] Switch
- [ ] Label

### Navegação
- [ ] Dropdown Menu
- [ ] Navigation Menu
- [ ] Breadcrumb
- [ ] Pagination
- [ ] Tabs

### Layout
- [ ] Card
- [ ] Dialog/Modal
- [ ] Sheet
- [ ] Popover
- [ ] Accordion
- [ ] Separator

### Feedback
- [ ] Alert
- [ ] Toast
- [ ] Progress
- [ ] Badge
- [ ] Avatar
- [ ] Skeleton

### Data Display
- [ ] Table
- [ ] DataTable
- [ ] Tooltip
- [ ] Calendar
- [ ] Command

## 🔧 Dependências

Já instaladas no `package.json`:
- ✅ `@headlessui/react` - Componentes acessíveis
- ✅ `@heroicons/react` - Ícones
- ✅ `clsx` - Merge de classes
- ✅ `tailwind-merge` - Otimização Tailwind

## 💡 Exemplo de Uso

```jsx
// Em qualquer arquivo do projeto
import { Button, Input, Card } from '@/components/ui'

function MyComponent() {
  return (
    <Card>
      <Input placeholder="Digite algo..." />
      <Button>Enviar</Button>
    </Card>
  )
}
```

## 🎨 Customização

Todos os componentes podem ser customizados via:
- Props `className` para adicionar classes Tailwind
- Props `variant` e `size` para variações predefinidas
- Modificação direta do código do componente

## 📚 Documentação

- Site oficial: https://www.untitledui.com
- Componentes: https://www.untitledui.com/react/components
- Headless UI: https://headlessui.com
- Tailwind CSS: https://tailwindcss.com

## ⚠️ Importante

- Sempre teste os componentes após adicionar
- Mantenha o `index.js` atualizado com as exportações
- Use a função `cn()` de `lib/utils.js` para merge de classes
- Commits frequentes após adicionar novos componentes
