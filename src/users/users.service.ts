import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { SignupInput } from 'src/auth/dto/inputs/signup.input';
import { In, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidRoles } from 'src/auth/enums/valid-roles.enums';

@Injectable()
export class UsersService {

  private logger: Logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}


  async create(signupInput: SignupInput): Promise<User> {
    try { 
      const newUser = this.userRepository.create({
        ...signupInput,
        password: await bcrypt.hash( signupInput.password, 10 )
      });
      return await this.userRepository.save( newUser );

    } catch (error) { 
      this.handleDBErrors(error);
    }
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.userRepository.findOneByOrFail({ email });
    } catch (error) {
      throw new NotFoundException(`User with email ${email} not found`);
      // this.handleDBErrors({
      //   code: '23503',
      //   detail: `User with email ${email} not found`
      // });
    }
  }
  
  async findOneById( id: string ): Promise<User> {
    try {
      return await this.userRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException(`User with id: ${id} not found`);
    }
  }

  findOne(id: string): Promise<User> {
    throw new Error('Method not implemented.');
  }
  async findAll( roles: ValidRoles[] ): Promise<User[]>{

    if ( roles.length === 0 ) 
      return await this.userRepository.find({
        //TODO: NO es necesario por que tenemos lazy en la propiedad lastUpdateBy
        // relations: { 
        //   lastUpdateBy: true
        // }
      });

    return this.userRepository.createQueryBuilder()
      .andWhere('ARRAY[roles] && ARRAY[:...roles]')
      .setParameter('roles', roles)
      .getMany();
  }

  async update( 
    id: string , 
    updateUserInput: UpdateUserInput,
    updateBy: User
  ): Promise<User> {
    
    try {
      const user = await this.userRepository.preload({
        ...updateUserInput,
        id
      });

      user.lastUpdateBy = updateBy;

      return await this.userRepository.save( user );

    } catch (error) {
      this.handleDBErrors(error);
    }

  }

  async block(id: string, adminUser: User ): Promise<User>{

    const userToBlock = await this.findOneById( id );
    userToBlock.isActive = false;
    userToBlock.lastUpdateBy = adminUser;

    return await this.userRepository.save( userToBlock );

  }

  private handleDBErrors (err: any): never {
    this.logger.error(err);

    if (err.code === '23505') {
      throw new BadRequestException( err.detail.replace('Key', '') );
    }

    throw new InternalServerErrorException( 'Please chech server logs ' );
  }
}
