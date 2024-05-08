import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { SEED_USERS, SEED_ITEMS, SEED_LISTS } from './data/seed-data';
import { ItemsService } from '../items/items.service';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { List } from 'src/lists/entities/list.entity';
import { ListItemService } from 'src/list-item/list-item.service';
import { ListsService } from 'src/lists/lists.service';
@Injectable()
export class SeedService {

  private isProd: boolean;

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,

    @InjectRepository(List)
    private readonly listRepository: Repository<List>,

    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly listItemService: ListItemService,
    private readonly listsService: ListsService,
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
    //crear list
    const list = await this.loadLists( user );
    //crear list items
    const items = await this.itemsService.findAll(user, { limit: 10, offset: 0 }, { search: '' });
    await this.loadListItems( list, items );

    console.log('Ejecutando seed');
    return true;
  }

  async deleteDatabase() {
    //borrar listItems 
    await this.listItemRepository.createQueryBuilder()
      .delete()
      .where({})
      .execute();

    //borrar listas
    await this.listRepository.createQueryBuilder()
      .delete()
      .where({})
      .execute();

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

  async loadLists ( user: User ): Promise<List> {
    // crear listas
    const listsPromise = [];

    for ( const list of SEED_LISTS ) {
      listsPromise.push( this.listsService.create( list, user ) );
    }

    const lists = await Promise.all( listsPromise );

    return lists[0];
  }

  async loadListItems( list: List, items: Item[]): Promise<void> {
    //crear list items
    for ( const item of items ) {
      this.listItemService.create( {
        quantity: Math.round( Math.random() * 10 ),
        completed: Math.round( Math.random() * 1 ) === 0 ? false : true,
        listId: list.id,
        itemId: item.id
      } );
    }
  }

}
