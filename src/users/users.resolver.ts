import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Int, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { ValidRolesArgs } from './dto/args/roles.arg';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles.enums';
import { ItemsService } from '../items/items.service';
import { Item } from 'src/items/entities/item.entity';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

@Resolver(() => User)
@UseGuards( JwtAuthGuard )
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService

  ) {}

  @Query(() => [User], { name: 'users' })
  findAll(
    @Args() validRoles: ValidRolesArgs,
    @CurrentUser([ValidRoles.superUser, ValidRoles.admin]) user: User
  ):Promise<User[]> {
    return this.usersService.findAll( validRoles.roles );
  }

  @Query(() => User, { name: 'user' })
  findOne(
    @Args( 'id', { type: () => ID }, ParseUUIDPipe ) id: string,
    @CurrentUser([ValidRoles.superUser, ValidRoles.admin]) user: User
  ): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Mutation(() => User, { name:'updateUser' })
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser([ ValidRoles.admin ]) user: User
  ): Promise<User> {

    return this.usersService.update( updateUserInput.id, updateUserInput, user );
  }

  @Mutation(() => User, { name: 'blockUser' })
  async blockUser(
    @Args( 'id', { type: () => ID }, ParseUUIDPipe ) id: string,
    @CurrentUser([ ValidRoles.admin ]) user: User
  ): Promise<User> {
    console.log( 'blockUser', user );
    return this.usersService.block( id, user );
  }

  @ResolveField( () => Int, { name: 'itemCount' } )
  async itemCount(
    @CurrentUser([ ValidRoles.admin ])adminUser: User,
    @Parent() user: User,
  ) : Promise<number> {
    return this.itemsService.itemCountByUser( user )
  }

  @ResolveField( () => [Item], { name: 'items' } )
  async getItemsByUser(
    @CurrentUser([ ValidRoles.admin ]) adminUser: User,
    @Parent() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs
  ) : Promise<Item[]> {
    return this.itemsService.findAll( user, paginationArgs, searchArgs );
  }

  //TODO:GetlistByUser 

}
