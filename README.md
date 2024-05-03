<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

# Ambiente Dev

### Instrucciones

1. Clonar proyecto
2. Copiar el `.env.template` y renombrar a `.env`

3. Ejecutar:

```
npm install
```

4. Levantar la imagen (Docker Desktop)

```
docker-compose up -d
```

5. Levantar el backend de nest

```
npm run start:dev
```

6. Visitar el sitio

```
localhost:3050/graphql
```

7. Ejecutar la **"mutacion"** executeSeed, para llenar la base de datos con la información
