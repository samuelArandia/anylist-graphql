import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Item } from 'src/items/entities/item.entity';
import { List } from 'src/lists/entities/list.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';

@Entity('ListItems')
@Unique('listItem-item', ['list','item'])
@ObjectType()
export class ListItem {

  
  @PrimaryGeneratedColumn('uuid') 
  @Field( () => ID )
  id: string; 

  @Column({type: 'numeric'})
  @Field( () => Number )
  quantity: number; 

  @Column({type: 'boolean'})
  @Field( () => Boolean )
  completed: boolean;


  //Relaciones 
  @ManyToOne( () => List, (list) => list.listItem, { lazy : true } )
  list: List; 

  @ManyToOne( () => Item, (item) => item.listItem, { lazy : true } )
  @Field( () => Item )
  item: Item;

}
