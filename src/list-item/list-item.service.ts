import { Injectable } from '@nestjs/common';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { ListItem } from './entities/list-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ListItemService {

  constructor(
    @InjectRepository(ListItem)
    private readonly listItemsRepository: Repository<ListItem>
  ) {}


  create(createListItemInput: CreateListItemInput) {
    
    const { itemId, listId, ...rest } = createListItemInput;

    const newListItem = this.listItemsRepository.create( {
      ...rest,
      item: { id: itemId },
      list: { id: listId }
    } );

    return this.listItemsRepository.save( newListItem );
  }

  async findAll():Promise<ListItem[]> {
    return this.listItemsRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} listItem`;
  }

  update(id: number, updateListItemInput: UpdateListItemInput) {
    return `This action updates a #${id} listItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} listItem`;
  }
}
