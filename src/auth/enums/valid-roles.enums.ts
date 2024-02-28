import { registerEnumType } from "@nestjs/graphql";

export enum ValidRoles { 
    admin       = 'admin', // 'admin' is the value of the enum
    user        = 'user', // 'user' is the value of the enum
    superUser   = 'superUser' // 'superUser' is the value of the enum
}

registerEnumType(ValidRoles, { name: 'ValidRoles', description: 'Roles that are valid for the application' }); // This is the line that makes the enum available to the GraphQL schema