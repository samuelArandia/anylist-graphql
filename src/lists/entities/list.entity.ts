import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';


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

}
