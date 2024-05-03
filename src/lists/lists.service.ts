import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateListInput } from './dto/create-list.input';
import { UpdateListInput } from './dto/update-list.input';
import { List } from './entities/list.entity';
import { User } from 'src/users/entities/user.entity';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

@Injectable()
export class ListsService {

  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>
  ) {}

  async create(createListInput: CreateListInput, user: User): Promise<List> {
    const list = this.listRepository.create({ ...createListInput, user });
    return await this.listRepository.save( list );
  }

  async findAll(user: User, paginationArgs: PaginationArgs, searchArgs: SearchArgs ): Promise<List[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const query = `SELECT * FROM "lists" 
    WHERE "userId" = '${user.id}' 
    ${search ? `AND LOWER(name) like '%${search.toLowerCase()}%'` : ''} 
    LIMIT ${limit} OFFSET ${offset}`;

    return await this.listRepository.query( query );
  }

  async findOne(id: string, user: User): Promise<List> {
    const list = await this.listRepository.findOneBy({
      id,
      user: {
        id: user.id
      }
    });
    if (!list) throw new NotFoundException(`list with #$ {id} not found`);

    return list;
  }

  async update(id: string, updateListInput: UpdateListInput, user: User ): Promise<List>{
    console.log( id );
    await  this.findOne( id, user );
    const list = await this.listRepository.preload( {...updateListInput, user} );

    if (!list) throw new NotFoundException(`list with id: ${id} not found`);

    return await this.listRepository.save( list );
  }

  async remove(id: string, user: User):Promise<List> {

    const list = await this.findOne( id, user );
    await this.listRepository.remove( list );
    return { ...list, id }; 
  }

  async listCountByUser ( user: User): Promise<number> {

    return this.listRepository.count({
      where: {
        user: { id: user.id }
      },
    })
  }


}
