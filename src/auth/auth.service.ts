import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignupInput, LoginInput} from './dto/inputs';
import { AuthResponse } from './types/auth-response.type';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    private getJwtToken( userId: string ) {
        return this.jwtService.sign({ id: userId });
    }

    async signup( singupInput: SignupInput ): Promise<AuthResponse> { 

        const user = await this.usersService.create( singupInput );

        const token = this.getJwtToken( user.id );

        return {
            user,
            token
        }
    }

    async login( { email, password }: LoginInput ): Promise<AuthResponse> {
        
        const user = await this.usersService.findOneByEmail( email );
        
        if ( !bcrypt.compareSync( password, user.password ) ) {
            throw new BadRequestException('Email or password are incorrect');
        }
         
        const token = this.getJwtToken( user.id );

        return {
            token, user 
        }
        
    }

    async validateUserById( id: string ): Promise<any> {
        const user = await this.usersService.findOneById( id );
        if ( !user.isActive) {
            throw new UnauthorizedException('User is inactive, talk with an admin');
        }
        delete user.password; // para que no fluja la contraseña
        return user;
    }

    revalidateToken ( user: User ): AuthResponse {
        const token = this.getJwtToken( user.id );
        return {
            token,
            user
        }
    }
}
