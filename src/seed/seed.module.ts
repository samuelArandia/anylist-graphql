import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SeedService } from './seed.service';
import { SeedResolver } from './seed.resolver';
import { UsersModule } from '../users/users.module';
import { ItemsModule } from '../items/items.module';
import { ListItemModule } from 'src/list-item/list-item.module';
import { ListsModule } from 'src/lists/lists.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    ItemsModule,
    ListItemModule,
    ListsModule
  ],
  providers: [SeedResolver, SeedService],

})
export class SeedModule {}
