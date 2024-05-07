import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';


@Entity({ name: 'lists' })
@ObjectType()
export class List {

  @Field( () => ID )
  @PrimaryGeneratedColumn('uuid')
  id: string; 

  @Field( () => String )
  @Column()
  name: string; 

  // relation, index('userId-list- index)
  // @Field( () => User)
  @ManyToOne ( () => User, (user) => user.lists, { nullable: false, lazy: true } )
  @Index('userId-list-index')
  @Field( () => User)
  user: User;


  @OneToMany( () => ListItem, (listItem) => listItem.list, { lazy: true } )
  // @Field( () => [ListItem] )
  listItem: ListItem[]

}
