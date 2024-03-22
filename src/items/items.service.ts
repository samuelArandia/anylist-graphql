import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput, UpdateItemInput } from './dto/inputs';
import { Item } from './entities/item.entity';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { SearchArgs, PaginationArgs} from 'src/common/dto/args';

@Injectable()
export class ItemsService {

  constructor(
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>
  ) {}

  async create( createItemInput: CreateItemInput, user:User ):Promise<Item> {
    // const query = `INSERT INTO "items" (name, "quantityUnits", "userId") VALUES ('${createItemInput.name}', '${createItemInput.quantityUnits}', '${user.id}') RETURNING *`;
    // const item = await this.itemsRepository.query( query );
    // return item[0];
    const item = this.itemsRepository.create({ ...createItemInput, user });
    return await this.itemsRepository.save( item );

  }
  async findAll( user: User, paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<Item[]> {

    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const query = `SELECT * FROM "items" 
    WHERE "userId" = '${user.id}' 
    ${search ? `AND LOWER(name) like '%${search.toLowerCase()}%'` : ''} 
    LIMIT ${limit} OFFSET ${offset}`;

    return this.itemsRepository.query( query );
    // const queryBuilder = this.itemsRepository.createQueryBuilder()
    //   .take( limit )
    //   .skip( offset )
    //   .where(`"userId" = :userId`, { userId: user.id });

    // if ( search ) {
    //   queryBuilder.andWhere(`LOWER(name) like :name`, { name: `%${ search.toLowerCase() }%` });
    // }

    // return queryBuilder.getMany();
    

    // return await this.itemsRepository.find({
    //   take: limit, // limit 10
    //   skip: offset, // offset 0
    //   where: {
    //     user: {
    //       id: user.id
    //     },
    //     name: Like(`%${search}%`) // SELECT * FROM items WHERE name LIKE '%search%'
    //   }
    // });
  }

  async findOne( id: string, user:User ): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({
      id,
      user: {
        id: user.id
      }
    });
    if (!item) throw new NotFoundException(`Item with #$ {id} not found`);

    return item;
  }

  async update(id: string, updateItemInput: UpdateItemInput, user: User): Promise<Item> {
    console.log( id );
    await  this.findOne( id, user );
    // const item = await this.itemsRepository.preload({ ...updateItemInput, user } );
    const item = await this.itemsRepository.preload( updateItemInput );

    if (!item) throw new NotFoundException(`Item with id: ${id} not found`);

    return await this.itemsRepository.save( item );
  }

  async remove(id: string, user: User) {
    //TODO: soft delete, integridiad referencial
    const item = await this.findOne( id, user );
    await this.itemsRepository.remove( item );
    return { ...item, id }; 
  }

  async itemCountByUser ( user: User): Promise<number> {

    return this.itemsRepository.count({
      where: {
        user: { id: user.id }
      },
    })
  }

}
