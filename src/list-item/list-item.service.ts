import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { ListItem } from './entities/list-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from 'src/lists/entities/list.entity';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ListItemService {

  constructor(
    @InjectRepository(ListItem)
    private readonly listItemsRepository: Repository<ListItem>

  ) {}


  async create(createListItemInput: CreateListItemInput) {
    
    const { itemId, listId, ...rest } = createListItemInput;

    const newListItem = this.listItemsRepository.create( {
      ...rest,
      item: { id: itemId },
      list: { id: listId }
    } );

    await this.listItemsRepository.save( newListItem );

    return this.findOne( newListItem.id );

  }

  async findAll( list: List, paginationArgs: PaginationArgs, searchArgs: SearchArgs ): Promise<ListItem[]> {

    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;
    
    const queryBuilder = this.listItemsRepository.createQueryBuilder('listItem') // <-- Nombre para las relaciones
      .innerJoin('listItem.item','item') // <--- Lo añadí después, fue un problema que no grabé
      .take( limit )
      .skip( offset )
      .where(`"listId" = :listId`, { listId: list.id });

    if ( search ) {
      queryBuilder.andWhere('LOWER(item.name) like :name', { name: `%${ search.toLowerCase() }%` });
    }

    return queryBuilder.getMany();

  }

  async countListItems( list: List ) : Promise<number> {
    return this.listItemsRepository.count({ 
     where: { list: { id: list.id } }
    });
  }


  async findOne(id: string): Promise<ListItem> {
    const listItem = await this.listItemsRepository.findOneBy( {id} );

    if ( !listItem ) {
      throw new NotFoundException(`ListItem with id ${ id } not found`);
    }

    return listItem;
  }

  async update(id: string, updateListItemInput: UpdateListItemInput): Promise<ListItem> {
    
    const { listId, itemId, ...rest } = updateListItemInput;

    const queryBuilder = this.listItemsRepository.createQueryBuilder()
      .update()
      .set( rest )
      .where('id = :id', { id });

    if ( listId ) {
      queryBuilder.set( { list: { id: listId } } );
    }
    if ( itemId ) {
      queryBuilder.set( { item: { id: itemId } } );
    }

    await queryBuilder.execute();

    return this.findOne( id );
  }

  remove(id: number) {
    return `This action removes a #${id} listItem`;
  }
}
