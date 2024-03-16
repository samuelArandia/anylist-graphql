import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ItemsModule } from './items/items.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports:[ AuthModule ],
      inject: [ JwtService ],
      useFactory: async ( jwtService: JwtService) => ({
        playground: false,
        autoSchemaFile: join( process.cwd(), 'src/schema.gql'),
        plugins: [
          ApolloServerPluginLandingPageLocalDefault()
        ],
        context({req, res}) {
          // const token = req.headers.authorization?.replace('Bearer ', '')
          // if ( !token ) throw Error('No token provided')
          
          // const payload = jwtService.decode( token )
          // if ( !payload ) throw Error('Invalid token')
        }
      })
    }), 

    
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //  // debug: false,
      // playground: false,
      // autoSchemaFile: join( process.cwd(), 'src/schema.gql'),
      // plugins: [
      //   ApolloServerPluginLandingPageLocalDefault()
      // ]
    // }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      autoLoadEntities: true,
    }),
    ItemsModule,
    UsersModule,
    AuthModule,
    SeedModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
