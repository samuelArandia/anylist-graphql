import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { SEED_USERS, SEED_ITEMS } from './data/seed-data';
import { ItemsService } from '../items/items.service';
@Injectable()
export class SeedService {

  private isProd: boolean;

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
  ) {
    this.isProd = configService.get('STATE') === 'prod';
  }

  async executeSeed():Promise<boolean> {
    if ( this.isProd ) {
      throw new UnauthorizedException('We not allow to execute seed in production environment');
    }
    //Limpiar la base de datos, borrar todo
    await this.deleteDatabase();
    // crear usuarios
    const user = await this.loadUsers();
    // crear items
    await this.loadItems( user );

    console.log('Ejecutando seed');
    return true;
  }

  async deleteDatabase() {
    //borrar items
    await this.itemsRepository.createQueryBuilder()
      .delete()
      .where({})
      .execute();
    //borrar usuarios

    await this.usersRepository.createQueryBuilder()
      .delete()
      .where({})
      .execute();
  }

  async loadUsers():Promise<User> {

    const users = [];

    for ( const user of SEED_USERS ) {
      users.push( await this.usersService.create( user ) );
    }
    return users[0];
  }

  async loadItems(user: User): Promise<void> {
    //crear items
    const itemsPromise = [];

    for ( const item of SEED_ITEMS ) {
      itemsPromise.push( this.itemsService.create( item, user ) );
    }
    await Promise.all( itemsPromise );
  }

}
