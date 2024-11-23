export type User = {
    id: string;
    name: string;
    email: string;
    password: string;
  };

  export type AuthenticatedUser = User & {
    access_token: string;
    sub: string;

};