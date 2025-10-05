# Projeto Django + React + Nginx

Projeto básico com Django (backend), React (frontend) e Nginx (reverse proxy) rodando em containers Docker.

## 📁 Estrutura

```
project/
├── backend/          # Django API
├── frontend/         # React App
├── nginx/            # Reverse Proxy
└── docker-compose.yml
```

## 🚀 Como Rodar

### 1. Subir todos os containers

```bash
docker-compose up --build
```

### 2. Acessar a aplicação

- **Frontend React**: http://localhost
- **API Django**: http://localhost/api
- **Admin Django**: http://localhost/admin

### 3. Criar superusuário Django (opcional)

```bash
docker-compose exec backend python manage.py createsuperuser
```

### 4. Fazer migrations

```bash
docker-compose exec backend python manage.py migrate
```

## 🔧 Comandos Úteis

```bash
# Parar todos os containers
docker-compose down

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Reconstruir sem cache
docker-compose build --no-cache

# Entrar no container do backend
docker-compose exec backend sh

# Entrar no container do frontend
docker-compose exec frontend sh
```

## 🌐 Como Funciona

1. **Nginx** recebe todas as requisições na porta 80
2. Requisições para `/api/*` são redirecionadas para o **Django** (porta 8000)
3. Requisições para `/admin/*` são redirecionadas para o **Django**
4. Todas as outras requisições vão para o **React** (porta 3000)

## 📝 Próximos Passos

Agora você pode:

1. Criar apps no Django dentro de `backend/djangoapp/`
2. Criar componentes React em `frontend/src/`
3. Adicionar rotas na API Django
4. Consumir a API no React

## ⚠️ Importante

- O arquivo `.env` está em `backend/dotenv_files/.env`
- As variáveis de ambiente já estão configuradas
- CORS já está configurado para aceitar requisições do frontend

## 🛠️ Tecnologias

- **Backend**: Django 4.2 + Django REST Framework
- **Frontend**: React 18
- **Proxy**: Nginx
- **Database**: PostgreSQL 13
- **Container**: Docker & Docker Compose
